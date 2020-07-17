import * as React from "react";

import { Dataset, Feature, Row } from "@lupa/lupa";

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

  const height = 1000;
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
  bounds.columns.forEach((col) => col.range.load(["values", "valueTypes"]));

  await context.sync();

  const features: Feature[] = bounds.columns.map((col) => {
    const values = ([] as any[]).concat(...col.range.values);
    const valueType = col.range.valueTypes[0][0];

    if (rangeIsContinuous(values, valueType)) {
      const min = Math.min(...values);
      const max = Math.max(...values);

      return {
        key: col.key,
        type: "continuous",
        range: [min, max],
      };
    }

    if (rangeIsDiscrete(values, valueType)) {
      return {
        key: col.key,
        type: "discrete",
        modalities: [...new Set(values)],
      };
    }

    throw new Error("We weren't supposed to get this far");
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
  // bounds.columns.forEach((col) => col.range.load(['values', 'valueTypes']));

  // await context.sync();

  const values = bounds.columns.reduce((acc: { [key: string]: any[] }, col) => {
    acc[col.key] = ([] as any[]).concat(...col.range.values);
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
): values is number[] {
  return (
    valueType === Excel.RangeValueType.double ||
    valueType === Excel.RangeValueType.integer
  );
}

// @ts-ignore
function rangeIsDiscrete(
  // @ts-ignore
  values: any[],
  valueType: Excel.RangeValueType
): values is string[] {
  return valueType === Excel.RangeValueType.string;
}
