---
title: Fonts
description: Load custom fonts with FontFace and FontFaceSet and use them in Canvas 2D text.
---

# Fonts

`@nativescript/canvas` implements the CSS Font Loading API (`FontFace` and `FontFaceSet`). A font you load becomes available to `ctx.font` straight away, with no native registration.

## Loading a font file

```ts
import '@nativescript/canvas-polyfill'; // provides document.fonts

const font = new FontFace('Serifa-Bold', 'url(~/fonts/Serifa-Bold.otf)', { weight: 'bold' });
document.fonts.add(font);
await font.load();

ctx.font = 'bold 25px Serifa-Bold';
ctx.fillText('Custom font', 10, 40);
```

::: warning
Write the source as `url(path)` **without quotes**. `.ttf`, `.otf`, `.woff` and `.woff2` files are recognised, and `~/` refers to the app folder.
:::

You can also pass the font data as an `ArrayBuffer` or a typed array:

```ts
const font = new FontFace('Brand', bytes);
```

Without the polyfill, `FontFace` is a global, and the font set is available as the global `fonts` or `FontFaceSet.instance`.

## Waiting for fonts

```ts
await document.fonts.load('12px Serifa-Bold');
document.fonts.check('12px Serifa-Bold'); // true

document.fonts.addEventListener('loadingdone', (e) => console.log(e.fontfaces));
document.fonts.addEventListener('loadingerror', () => console.log('failed'));
```

`FontFaceSet` supports `add`, `delete`, `clear`, `check`, `load`, `ready`, `size`, and iteration with `forEach`, `entries`, `keys` and `values`.

## Fonts from CSS

`importFontsFromCSS(url)` reads the `@font-face` rules in a stylesheet (for example, from Google Fonts), loads every font in it, and resolves with the resulting `FontFace` objects:

```ts
import { importFontsFromCSS } from '@nativescript/canvas';

await importFontsFromCSS('https://fonts.googleapis.com/css2?family=Inter:wght@400;700');
ctx.font = '700 20px Inter';
```

`loadFontsFromCSS(url)` parses the same rules but does **not** load the fonts. It resolves with unloaded `FontFace` objects, so you can pick the ones you need and call `load()` on each.

## Descriptors

`new FontFace(family, source, descriptors)` accepts `style`, `weight`, `stretch`, `display`, `unicodeRange`, `featureSettings`, `variationSettings`, `ascentOverride`, `descentOverride` and `lineGapOverride`.
