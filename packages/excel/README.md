<h3 align="center">
  Lupa Excel
</h3>

<p align="center">
  Use Excel data inside <a href="https://facebook.github.io/react">React</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lupa/excel"><img src="https://img.shields.io/npm/v/@lupa/excel?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@lupa/excel"><img src="https://img.shields.io/npm/dm/@lupa/excel?style=flat-square"></a>
  <a href="https://travis-ci.com/mondobrain/@lupa/excel"><img src="https://img.shields.io/travis/com/mondobrain/@lupa/excel/master?style=flat-square"></a>
</p>

## Installation

`Lupa` is on NPM so install using your preferred JS package manager.

```bash
yarn add @lupa/excel @lupa/lupa
npm install @lupa/excel @lupa/lupa
```

## Usage

Wrap the top level of your React app in the `<ExcelDataset>` component;
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

  const onClick = React.useCallback(() => {
    if (typeof data === 'function') {
      (async () => {
        const d = await data();
        console.log(d);
      })();
    } else {
      console.log(data);
    }
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