import * as React from "react";

import { Dataset, Feature, Row } from "@lupa/lupa";

//////////////////////////
// CONSTS
//////////////////////////
const DATE_CODES = ["yy", "m", "d", "h", "s", "AM/PM", "A/P"];

//////////////////////////
// COMPONENTS
//////////////////////////

/**
 * Internal component. Handles actual creation of \<Dataset\>.
 */
export function ExcelDataset({ children }: ExcelDatasetProps) {
  // Ready Wrapper
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    Office.onReady(() => setReady(true));
  }, [setReady]);

  const [features, setFeatures] = React.useState<Feature[]>();
  const [bounds, setBounds] = React.useState<Bounds>();

  React.useEffect(() => {
    if (!ready) return;
    Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const bnds = await getBounds(context, sheet);

      const features = await getFeatures(context, bnds);

      setBounds(bnds);
      setFeatures(features);
    });
  }, [ready, setFeatures, setBounds]);

  const data = React.useCallback(
    () =>
      Excel.run(async (context) =>
        bounds ? await getData(context, bounds) : [{}]
      ),
    [bounds]
  );

  const height = bounds ? bounds.rows : 0;
  const width = features ? features.length : 0;

  return (
    <Dataset
      children={children}
      features={features ? features : []}
      shape={[height, width]}
      data={data}
    />
  );
}

export interface ExcelDatasetProps {
  children?: React.ReactNode;
}

//////////////////////////
// EXCEL Methods
//////////////////////////

/**
 * Async function that returns the shape of a dataset
 * @param context The context to run operations against
 * @param sheet The worksheet to check the bounds on
 */
export async function getBounds(
  context: Excel.RequestContext,
  sheet: Excel.Worksheet
): Promise<Bounds> {
  const usedRange = sheet.getUsedRangeOrNullObject(true);

  // Let OfficeJS know we need these attributes
  usedRange.load([
    "rowCount",
    "columnCount",
    "address",
    "columnIndex",
    "rowIndex",
  ]);

  await context.sync();

  if (usedRange.isNullObject) {
    throw new Error("lupa: no data found in the selected worksheet");
  }

  const columnRanges = [];
  for (let i = 0; i < usedRange.columnCount; i++) {
    const columnRange = usedRange.getColumn(i);

    const headerRange = columnRange.getRow(0);
    const dataRange = columnRange.getRowsBelow(-(usedRange.rowCount - 1));

    headerRange.load(["values"]);

    columnRanges.push({ headerRange, dataRange });
  }

  await context.sync();

  const columns = columnRanges.map(({ headerRange, dataRange }) => {
    const key = headerRange.values[0][0] as string;
    return { key, range: dataRange };
  });

  return { columns, rows: usedRange.rowCount - 1 };
}

/**
 * Returns an array of Dataset.Features
 * @param context The context to run operations against
 * @param bounds The bounds that the feature array should be built from
 */
export async function getFeatures(
  context: Excel.RequestContext,
  bounds: Bounds
): Promise<Feature[]> {
  bounds.columns.forEach((col) =>
    col.range.load(["values", "valueTypes", "numberFormat"])
  );

  await context.sync();

  const features: Feature[] = bounds.columns.map((col) => {
    const values = ([] as any[]).concat(...col.range.values);
    const valueType = col.range.valueTypes[0][0];

    if (rangeIsContinuous(values, valueType)) {
      const numbersOnly = values.filter(
        (d) => d !== null && d !== ""
      ) as number[];

      let range: [number, number] | [Date, Date] = [
        Math.min(...numbersOnly),
        Math.max(...numbersOnly),
      ];

      const numberFormat = col.range.numberFormat[0][0];
      if (isDateFormat(numberFormat)) {
        range = [numberToDate(range[0]), numberToDate(range[1])];
      }

      return {
        key: col.key,
        type: "continuous",
        range,
      };
    }

    if (rangeIsDiscrete(values, valueType)) {
      return {
        key: col.key,
        type: "discrete",
        modalities: [...new Set(values)],
      };
    }

    if (valueType === Excel.RangeValueType.empty) {
      throw new Error("lupa: first row of data cannot contain empty values");
    }

    throw new Error(
      `lupa: cells with valueType ${valueType} are not supported`
    );
  });

  return features;
}

/**
 * Returns an array of objects representing the range
 * @param context The context to run operations against
 * @param bounds The bounds to get the data from
 */
// @ts-ignore
export async function getData(context: Excel.RequestContext, bounds: Bounds) {
  const values = bounds.columns.reduce((acc: { [key: string]: any[] }, col) => {
    let cleanedValues = ([] as any[]).concat(...col.range.values);
    const valueType = col.range.valueTypes[0][0];

    if (rangeIsContinuous(cleanedValues, valueType)) {
      cleanedValues = cleanedValues.map((d) => (d === "" ? null : d));

      const numberFormat = col.range.numberFormat[0][0];
      if (isDateFormat(numberFormat)) {
        cleanedValues = cleanedValues.map(numberToDate);
      }
    }
    acc[col.key] = cleanedValues;
    return acc;
  }, {});

  const keys = Object.keys(values);

  const data = values[keys[0]].map((_, i) => {
    return keys.reduce((acc: Row, key) => {
      acc[key] = values[key][i];
      return acc;
    }, {});
  });

  return data;
}

//////////////////////////
// TYPES
//////////////////////////
export interface Bounds {
  columns: { key: string; range: Excel.Range }[];
  rows: number;
}

//////////////////////////
// TYPE GUARDS
//////////////////////////

function rangeIsContinuous(
  // @ts-ignore
  values: any[],
  valueType: Excel.RangeValueType
): values is (number | null | "")[] {
  return (
    valueType === Excel.RangeValueType.double ||
    valueType === Excel.RangeValueType.integer
  );
}

function rangeIsDiscrete(
  // @ts-ignore
  values: any[],
  valueType: Excel.RangeValueType
): values is string[] {
  return valueType === Excel.RangeValueType.string;
}

//////////////////////////
// UTILS
//////////////////////////
function isDateFormat(numberFormat: any) {
  return DATE_CODES.some((d) => numberFormat.includes(d));
}

function numberToDate(num: number) {
  const utcDays = Math.floor(num - 25568);
  const utcValue = utcDays * 86400;
  const dateInfo = new Date(utcValue * 1000);

  const fractionalDay = num - Math.floor(num) + 0.0000001;

  const totalSeconds = Math.floor(86400 * fractionalDay);
  const seconds = totalSeconds % 60;
  const remainingSeconds = totalSeconds - seconds;

  const hours = Math.floor(remainingSeconds / (60 * 60));
  const minutes = Math.floor(remainingSeconds / 60) % 60;

  return new Date(
    dateInfo.getFullYear(),
    dateInfo.getMonth(),
    dateInfo.getDate(),
    hours,
    minutes,
    seconds
  );
}
