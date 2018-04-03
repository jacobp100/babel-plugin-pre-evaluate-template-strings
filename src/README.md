# babel-plugin-pre-evaluate-template-strings

This is an attempt to release a standalone version of the part of [linaria](https://github.com/callstack/linaria) that does pre-evaluation on template literals. The aim is to have this be generic enough it can be used in any CSS-in-JS framework to help with static extraction of stylesheets.

This is currently very much copy-and-paste from Linaria, so huge thanks to them for the work!

Currently this will pre-process every template literal. However, we also expose a generic `resolveTemplateLiteral` for use in other babel plugins.

###### In

```js
const world = 'world';
const test = `
  hello ${world}
`;
```

###### Out

```js
const world = 'world';
const test = `
  hello world
`;
```

It also works with imports from modules.

There seems to be a way to mock modules. This will have to be exposed for CSS-in-JS to work.
