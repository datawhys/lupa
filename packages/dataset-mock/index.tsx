import * as React from "react";

import { Dataset, Row, Feature } from "@mondobrain/dataset";

/**
 * A <Dataset> that provides mock data.
 */
export function MockDataset({ children, data }: MockDatasetProps) {
  const featKeys = Object.keys(data[0]);
  const feats: Feature[] = featKeys.map((key) => {
    const feat = data.map((r: Row) => r[key]);

    if (typeof data[0][key] === "string") {
      const mods = [...new Set(feat as string[])];

      return { key, type: "discrete", modalities: mods };
    }

    const min = Math.min(...(feat as number[]));
    const max = Math.max(...(feat as number[]));
    return { key, type: "continuous", range: [min, max] };
  });

  const height = data.length;
  const width = feats.length;

  return (
    <Dataset
      children={children}
      features={feats}
      shape={[height, width]}
      data={data}
    />
  );
}

export interface MockDatasetProps {
  children?: React.ReactNode;
  data: Row[];
}
