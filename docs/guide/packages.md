# Molecule Packages

There are multiple packages for Molecule on npm by the `@moleculejs` organization. These packages are for using different rendering methods or extending Molecule's features.

## Molecule

- Name: `molecule`
- Install: `yarn add @moleculejs/molecule` or `npm i @moleculejs/molecule`

This is the main package on which the others build. It exposes a method that takes a render method and returns a baseclass, we can extend to create custom elements.

## MoleculeLit

- Name: `molecule-lit`
- Install: `yarn add @moleculejs/molecule-lit` or `npm i @moleculejs/molecule-lit`

This exposes a class that uses Molecule with [lit-html's](https://github.com/Polymer/lit-html) render method. It also gives you all of the lit-html exports and methods.

## MoleculeLitExtended <Badge text="deprecated" type="warn"></Badge>

- Name: `molecule`
- Install: `yarn add @moleculejs/molecule-lit-extended` or `npm i @moleculejs/molecule-lit-extended`

The same as `MoleculeLit`, but for lit-extended. Deprecated, because lit-html removed lit-extended.

## MoleculeJsx

- Name: `molecule-jsx`
- Install: `yarn add @moleculejs/molecule-jsx` or `npm i @moleculejs/molecule-jsx`

This exposes a class that uses Molecule renders Jsx to the Element's root. The Jsx is created using the `createElement` or `h` methods exposed by `MoleculeJsx`. It also allows for mixed cased events like `MyPascalCasedEvent`, by setting the listener using `on-`.

```jsx
<my-el on-MyPascalCasedEvent={handleMyPascalEvent} />
```

## MoleculeFunctional

- Name: `molecule`
- Install: `yarn add @moleculejs/molecule` or `npm i @moleculejs/molecule`

This allows you to create simple Molecule Elements without needing to create a class:

```js
const Example = functionalMolecule(myRenderMethod)({
  // The properties
  a: 3,
  b: {
    attribute: 'my-b',
    type: Number,
    value: 0,
  },
})(({ a, b }) => {
  // The render callback
  `${a}/${b}`;
});

customElements.define('my-example', Example);
```

## MoleculeFunctionalLit

- Name: `molecule-functional-lit`
- Install: `yarn add @moleculejs/molecule-functional-lit` or `npm i @moleculejs/molecule-functional-lit`

Uses lit-html's render method with MoleculeFunctional, therefore you do not need to pass a render method:

```js
const Example = functionalMoleculeLit({
  // The properties
  a: 3,
  b: {
    attribute: 'my-b',
    type: Number,
    value: 0,
  },
})(({ a, b }) => {
  // The render callback
  html`
    ${a}/${b}
  `;
});

customElements.define('my-example', Example);
```

## MoleculeFunctionalLitExtended <Badge text="deprecated" type="warn"></Badge>

- Name: `molecule-functional-lit-extended`
- Install: `yarn add @moleculejs/molecule-functional-lit-extended` or `npm i @moleculejs/molecule-functional-lit-extended`

Same as MoleculeFunctionaLit, but with lit-extended. Deprecated, because lit-html removed lit-extended.

```js
const Example = functionalMoleculeLitExtended({
  // The properties
  a: 3,
  b: {
    attribute: 'my-b',
    type: Number,
    value: 0,
  },
})(({ a, b }) => {
  // The render callback
  html`
    ${a}/${b}
  `;
});

customElements.define('my-example', Example);
```

## MoleculeLitDirectiveSetElement <Badge text="deprecated" type="warn"></Badge>

- Name: `molecule`
- Install: `yarn add @moleculejs/molecule` or `npm i @moleculejs/molecule`

This is a directive for lit-html to insert custom elements into your lit-html template.

It is currently deprecated, because lit-html currently has now fixed implementation of directives. As soon, as they do, it will be back.

```js
class MyExample extends MoleculeLit {
  //...
}

customElements.define('my-example', MyExample);

const props = {
  a: 3,
  b: 'abc',
};

const attributes = {
  id: 'test',
  class: 'my-elem',
};

const template = html`
  ${setElement(MyExample, props, attributes)}
`;
```

## MoleculeDecorators <Badge text="experimental" type="warn"></Badge>

- Name: `molecule-decorators`
- Install: `yarn add @moleculejs/molecule-decorators` or `npm i @moleculejs/molecule-decorators`

Implements Molecule for typescript decorators.
