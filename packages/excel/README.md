<h3 align="center">
  Lupa Excel
</h3>

<p align="center">
  Use Excel data inside <a href="https://facebook.github.io/react">React</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lupa/excel"><img src="https://img.shields.io/npm/v/@lupa/excel?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@lupa/excel"><img src="https://img.shields.io/npm/dm/@lupa/excel?style=flat-square"></a>
  <a href="https://bundlephobia.com/result?p=@lupa/excel"><img src="https://img.shields.io/bundlephobia/minzip/@lupa/excel?style=flat-square"></a>
</p>

## Installation

`Lupa` is on NPM so install using your preferred JS package manager.

```bash
yarn add @lupa/excel @lupa/lupa
npm install @lupa/excel @lupa/lupa
```

## Usage

In order for the `<ExcelDataset>` component to load, you need to have [Office.js][1] loaded. The easiest way to load [Office.js][1] is to include the following script tag in your page header

```html
<script src="https://appsforoffice.microsoft.com/lib/1/hosted/Office.js" type="text/javascript"></script>
```

With [Office.js][1] loaded, wrap the top level of your React app in the `<ExcelDataset>` component;

```jsx
import { ExcelDataset } from '@lupa/excel';


export default function App() {
  return (
    <ExcelDataset>
      <div>The rest of my app</div>
      <SomeChild />
    </ExcelDataset>
  )
}

```

Now in any of the components underneath `<ExcelDataset>` you can use the various hooks from `@lupa/lupa`;

```jsx
import React from 'react';
import { useData, useFeatures, useShape } from '@lupa/lupa';

export default function LupaInfo() {
  const data = useData();
  const features = useFeatures();
  const shape = useShape();

  const onClick = React.useCallback(async () => {
    // We know that `data` is an async function because we're inside <ExcelDataset>
    // Generic components should use `dataIsAsyncMethod` or `dataIsRowArray` from '@lupa/lupa'
    const d = await data();
    console.log(d);
  }, [data]);

  return (
    <div>
      <h2>Data</h2>
      <div>
        <h4>Shape</h4>
        {shape}
      </div>
      <div>
        <h4>Features</h4>
        {features.map(f => <div key={f.key}>{key}</div>)}
      </div>
      <div>
        <h4>Data</h4>
        <button onClick={onClick}>Show data</button>
      </div>
    </div>
  )
}
```

[//]: # (Link References)
[1]: https://docs.microsoft.com/en-us/office/dev/add-ins/develop/understanding-the-javascript-api-for-office "OfficeJS"