![](./screenshot.webp)

# Coverflow Component

This provides a Web Component for an interface similar to Coverflow.

## Installation

```bash
npm install @trovster/coverflow --save
```

## Usage

These are [Web
Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components) and
must be imported before the custom elements can be used.

```html
<script type="module">
  import '@trovster/coverflow/src/Coverflow.js';
</script>
```

You should create a list of images and then wrap them in `<cover-flow>` to turn
them into a Coverflow component.

```html
<cover-flow>
  <ul>
    <li><img src="#" /></li>
    <li><img src="#" /></li>
    <li><img src="#" /></li>
    <li><img src="#" /></li>
  </ul>
</cover-flow>
```

### Styling

You should set the background using the `--bg` CSS variable. This is used to mask
the relection correctly. This defaults to `#fff`.

## Development

### Linting and Formatting

To scan the project for linting and formatting errors, run:

```bash
npm run lint
```

To automatically fix linting and formatting errors, run:

```bash
npm run format
```

### Local Demo with `web-dev-server`

To start a local development server that serves the basic demo located in
`docs/index.html`, run:

```bash
npm start
```

### Tooling Configs

For most of the tools, the configuration is in the `package.json` to minimize
the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to
individual files.
