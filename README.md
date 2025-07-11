# Shiver Text

A library written in TypeScript for creating a smooth shiver-shuffling animation for your text. Perfect for creating engaging text reveals with a cyberpunk/glitch feel.

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

### Basic Usage (vanilla JS - UMD)

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

    <!-- Import shiver-text UMD build -->
    <script src="https://unpkg.com/shiver-text@0.2.0/dist/index.js"></script>
    <script>
      // ShiverText is available globally

      console.log("ShiverText:", typeof ShiverText); // ShiverText available: object
      console.log("createShiverText:", typeof ShiverText.createShiverText); // createShiverText: function

      // Create instances
      const shiverInstance1 = ShiverText.createShiverText("#demo1");
      const shiverInstance2 = ShiverText.createShiverText("#demo2", {
        duration: 100,
        delay: 60,
        charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*",
      });
      const shiverInstance3 = ShiverText.createShiverText("#demo3");

      // Demo functions
      function startDemo1() {
        shiverInstance1.start();
      }

      function startDemo2() {
        shiverInstance2.start();
      }

      function changeText() {
        const texts = [
          "JavaScript is awesome!",
          "TypeScript rocks!",
          "Web development is fun!",
          "Shiver text effect!",
        ];
        const randomText = texts[Math.floor(Math.random() * texts.length)];
        shiverInstance3.setText(randomText);
      }
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
  /** Set new text and optionally start animation */
  setText(text: string, autoStart?: boolean): void;
}
```

### Instance Methods

- `shiverTextInstance.start()`: Start the shiver animation
- `shiverTextInstance.stop()`: Stop the current animation
- `shiverTextInstance.setText(text, autoStart?)`: Set new text and optionally start animation

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

- Chrome/Edge 61+
- Firefox 55+
- Safari 10.1+
- All modern browsers with `requestAnimationFrame` support

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or open up a Pull Request.
