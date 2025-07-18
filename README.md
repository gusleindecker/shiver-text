# Shiver Text

[![Latest NPM release](https://img.shields.io/npm/v/shiver-text.svg)](https://www.npmjs.com/package/shiver-text)
![MIT License](https://img.shields.io/npm/l/shiver-text.svg)

A small library (6kb gzipped) written in TypeScript for creating a smooth shiver-shuffling animation for your text. Perfect for creating engaging text reveals with a cyberpunk/glitch feel.

![Shiver Text Animation Demo](shiver-text.gif)

## Features

- 🎯 **Smooth Animations**: Buttery smooth 60fps animations using `requestAnimationFrame`
- 🔤 **Letter-by-letter Reveal**: Text reveals progressively from left to right
- ⚡ **Fast & Lightweight**: No dependencies, minimal footprint
- 🎨 **Customizable**: Control timing, characters, and animation behavior
- 📱 **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, etc.
- 🦾 **TypeScript**: Full type safety and IntelliSense support

## Installation

```bash
npm install shiver-text
```

## Quick Start

### Usage with a Bundler (ESM)

```javascript
import { createShiverText } from "shiver-text";

// Get your element
const myElement = document.getElementById("my-element");

// Create an instance and start the animation
const shiverInstance = createShiverText(myElement);
shiverInstance.start();
```

### Basic Usage (Vanilla JS with a `<script>` tag)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Shiver Text UMD Test</title>
  </head>
  <body>
    <h1>Shiver Text UMD Demo</h1>

    <div id="demo1">Hello World!</div>
    <button onclick="startDemo1()">Start Animation</button>

    <div id="demo2">Welcome to the matrix...</div>
    <button onclick="startDemo2()">Slower Animation</button>

    <div id="demo3"></div>
    <button onclick="changeText()">Change Text</button>

    <!-- Import shiver-text UMD build in your HTML -->
    <script src="https://cdn.jsdelivr.net/npm/shiver-text@latest/dist/index.js"></script>
    <script>
      // ShiverText is available globally

      const shiverTextInstance = ShiverText.createShiverText("#my-element", {
        duration: 100,
        delay: 60,
        charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*",
      });
      shiverTextInstance.start();
    </script>
  </body>
</html>
```

## API Reference

### `createShiverText(element, options?)`

Creates a new ShiverText instance.

**Parameters:**

- `element: HTMLElement | string` - DOM element or selector
- `options: ShiverTextOptions` (optional) - Animation options

**Returns:** `ShiverTextInstance`

### Types

#### Options

```typescript
interface ShiverTextOptions {
  /** Duration for each character to settle (ms) - default: 60 */
  duration?: number;

  /** Characters to use for shuffling - default: alphanumeric + symbols */
  charset?: string;

  /** Delay between each character starting (ms) - default: 40 */
  delay?: number;

  /** Number of characters to scramble after the last revealed one - default: 3 */
  scrambleRange?: number;

  /** Callback when animation completes */
  onComplete?: () => void;

  /** Callback on each frame update */
  onUpdate?: (text: string) => void;
}
```

#### ShiverTextInstance

```typescript
interface ShiverTextInstance {
  /** Start the shiver animation */
  start(): void;
  /** Stop the current animation */
  stop(): void;
  /** Set new text and start the animation. */
  setText(text: string, autoStart?: boolean = true): void;
}
```

### Instance Methods

- `start()`: Start the shiver animation
- `stop()`: Stop the current animation
- `setText(text, autoStart?)`: Set new text and optionally start animation

## Examples

### React Component

```tsx
import React, { useEffect, useRef } from "react";
import { createShiverText, ShiverTextInstance } from "shiver-text";

const ShiverTextComponent: React.FC<{ text: string }> = ({ text }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const shivererRef = useRef<ShiverTextInstance | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      shivererRef.current = createShiverText(elementRef.current, {
        duration: 100,
        delay: 30,
      });
    }

    return () => {
      shivererRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (shivererRef.current) {
      shivererRef.current.setText(text);
    }
  }, [text]);

  return <div ref={elementRef} className="shiver-text" />;
};
```

### Vue Component

```vue
<script setup lang="ts">
import { onMounted, useTemplateRef, type ShallowRef } from "vue";
import { createShiverText, type ShiverTextOptions } from "shiver-text";

const textDiv = useTemplateRef("textDiv") as Readonly<
  ShallowRef<HTMLDivElement>
>;

onMounted(() => {
  const shiverTextOptions: ShiverTextOptions = {
    duration: 10,
    delay: 8,
    scrambleRange: 15,
  };
  createShiverText(textDiv.value, shiverTextOptions).start();
});
</script>

<template>
  <div ref="textDiv">
    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur
    condimentum pellentesque nunc non viverra. Phasellus non magna at diam
    mattis volutpat sit amet et lorem. Class aptent taciti sociosqu ad litora
    torquent per conubia nostra, per inceptos himenaeos. Vivamus augue lacus,
    dapibus quis bibendum ac, mattis finibus magna. Donec laoreet nisl erat,
    convallis blandit nunc hendrerit ac. Suspendisse viverra ante id nulla
    pretium, eget pellentesque diam luctus. Vivamus quis libero orci.
  </div>
</template>
```

## Browser Support

This library is compiled to ES2020 JavaScript, making it compatible with a wide range of modern browsers, including:

- Chrome >= 80
- Firefox >= 74
- Safari >= 13.1
- Edge >= 80

The animation relies on `requestAnimationFrame`, which is broadly supported in all modern browsers.

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please submit issues or open up a Pull Request.
