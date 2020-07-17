import * as React from "react";

function invariant(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

const DatasetContext = React.createContext<DatasetContextObject>({});

// Marked as optional as the <Dataset> component defines the values (through passed props)
interface DatasetContextObject {
  data?: Data;

  features?: Feature[];
  shape?: Shape;
}

//////////////////////////
// COMPONENTS
//////////////////////////

/**
 * Provides dataset context for the rest of the app.
 *
 * Note: You usually won't render a \<Dataset\> directly. Instead, you'll render a
 * dataset that is more specific to your environment such as an \<ExcelDataset\>
 * in Excel or a \<MockDataset\> for a fake dataset.
 */
export function Dataset({
  children = null,
  features,
  shape,
  data,
}: DatasetProps): React.ReactElement {
  invariant(
    !useInDatasetContext(),
    "You cannot render a <Dataset> inside another <Dataset>."
  );

  return (
    <DatasetContext.Provider
      children={children}
      value={{ features, shape, data }}
    />
  );
}

export interface DatasetProps extends Required<DatasetContextObject> {
  children?: React.ReactNode;
}

//////////////////////////
// HOOKS
//////////////////////////
/**
 * Returns true if this component is a descendant of a \<Dataset\>.
 */
export function useInDatasetContext(): boolean {
  return React.useContext(DatasetContext).shape != null;
}

/**
 * Returns the current data value. Will either be an async func or an array of Rows.
 */
export function useData(): Data {
  invariant(
    useInDatasetContext(),
    "useData() may only be used in the context of a <Dataset> component."
  );

  return React.useContext(DatasetContext).data as Data;
}

/**
 * Returns the current features array, which represent feature attributes.
 */
export function useFeatures(): Feature[] {
  invariant(
    useInDatasetContext(),
    "useFeatures() may only be used in the context of a <Dataset> component."
  );

  return React.useContext(DatasetContext).features as Feature[];
}

/**
 * Returns the current shape array, which represents the shape.
 */
export function useShape(): Shape {
  invariant(
    useInDatasetContext(),
    "useShape() may only be used in the context of a <Dataset> component."
  );

  return React.useContext(DatasetContext).shape as Shape;
}

//////////////////////////
// TYPES
//////////////////////////
/**
 * Data can either be an array of rows or an async function that returns an array of rows
 */
export type Data = Row[] | (() => Promise<Row[]>);

/**
 * A Feature can either be discrete or continuous
 */
export type Feature =
  | { key: string; type: "discrete"; modalities: string[] }
  | { key: string; type: "continuous"; range: [number, number] };

/**
 * A Row can hold either discrete values or continuous values at any key
 */
export interface Row {
  [key: string]: string | number;
}

/**
 * Shape follows numpy conventions for shape - (height, width)
 */
export type Shape = [number, number];
