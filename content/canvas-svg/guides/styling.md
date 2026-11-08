---
title: Styling
description: Style an SVG document with the stylesheet property, and pass view styles such as color and fill through to it.
---

# Styling

NativeScript CSS in `app.css` styles the `<Svg>` view itself, not the elements inside its document. There are two ways to reach those elements: the `stylesheet` property, and the view styles that the document inherits.

## The `stylesheet` property

`stylesheet` takes CSS text, or a `~/`, absolute or http path to a `.css` file. It works like a `<style>` element at the top of the SVG, so it supports full rules and `@keyframes`. Use it for CSS kept outside the SVG, such as a CodePen's CSS panel:

```xml
<svg:Svg src="~/assets/loader.svg" stylesheet="~/assets/loader.css" />
```

```ts
view.stylesheet = `
  @keyframes pulse { 50% { opacity: 0.3; } }
  .dot { animation: pulse 1s ease-in-out infinite; }
`;
```

- It is applied again every time `src` reloads.
- Views that [share a `src`](/canvas-svg/guides/properties-and-events) share a document only if they also have the same `stylesheet`.
- For a document built with the [DOM](/canvas-svg/guides/dom) rather than `src`, only its `@keyframes` apply.

## View styles

These styles on the view are inherited by the document, as they would be by an inline `<svg>` on the web:

`color`, `fill`, `fill-rule`, `fill-opacity`, `stroke`, `stroke-width`, `stroke-linecap`, `stroke-linejoin` and `stroke-miterlimit`

They can come from a class in `app.css` or from an inline `style`. `color` is what `currentColor` resolves to, which makes single-colour icons easy to theme:

```xml
<svg:Svg src="~/assets/icon.svg" style="color: #f43f5e; stroke-width: 2" />
```

Only the properties you set are passed on, so the document's own attributes apply otherwise.

## Selectors

Rules in `stylesheet`, and in the document's own `<style>` blocks, support:

- type, `*`, `#id`, `.class` and attribute selectors
- `:root`, `:first-child`, `:last-child` and `:only-child`
- the descendant, `>`, `+` and `~` combinators

Any of these selectors can start a CSS animation. See [Animation](/canvas-svg/guides/animation#css).

## Related docs

- [Properties and Events](/canvas-svg/guides/properties-and-events)
- [Animation](/canvas-svg/guides/animation)
