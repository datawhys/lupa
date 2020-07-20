<h3 align="center">
  Lupa Mock
</h3>

<p align="center">
  Use Mock/Static data inside <a href="https://facebook.github.io/react">React</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@lupa/mock"><img src="https://img.shields.io/npm/v/@lupa/mock?style=flat-square"></a>
  <a href="https://www.npmjs.com/package/@lupa/mock"><img src="https://img.shields.io/npm/dm/@lupa/mock?style=flat-square"></a>
  <a href="https://travis-ci.com/mondobrain/@lupa/mock"><img src="https://img.shields.io/travis/com/mondobrain/@lupa/mock/master?style=flat-square"></a>
</p>

## Installation

`Lupa` is on NPM so install using your preferred JS package manager.

```bash
yarn add @lupa/mock @lupa/lupa
npm install @lupa/mock @lupa/lupa
```

## Usage

Wrap the top level of your React app in the `<MockDataset>` component. The `MockDataset` component requires an array of objects be passed to the `data` prop.

```jsx
import { MockDataset } from '@lupa/mock';

const data = [
  { name: "Product A", price: 12.34, unitsSold: 56 },
  { name: "Product B", price: 0.98, unitsSold: 7 },
  { name: "Product C", price: 43.12, unitsSold: 89 },
]


export default function App() {
  return (
    <MockDataset data={data}>
      <div>The rest of my app</div>
      <SomeChild />
    </MockDataset>
  )
}

```

Now in any of the components underneath `<MockDataset>` you can use the various hooks from `@lupa/lupa`;

```jsx
import React from 'react';
import { useData, useFeatures, useShape } from '@lupa/lupa';

export default function LupaInfo() {
  const data = useData(); // If using typescript you may want to specify as `Row[]` if you are inside the <MockDataset>
  const features = useFeatures();
  const shape = useShape();

  const onClick = React.useCallback(() => {
    console.log(data);
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