# Shiver Text

[![Latest NPM release](https://img.shields.io/npm/v/shiver-text.svg)](https://www.npmjs.com/package/shiver-text)
![MIT License](https://img.shields.io/npm/l/shiver-text.svg)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/shiver-text)

A small library written in TypeScript for creating a smooth shiver-shuffling animation for your text. Perfect for creating engaging text reveals with a cyberpunk/glitch feel.

![Shiver Text Animation Demo](shiver-text.gif)

## Features

- 🎯 **Smooth Animations**: Optimized 60fps animations using `requestAnimationFrame`
- 🔤 **Letter-by-letter Reveal**: Text reveals progressively from left to right
- ⚡ **Fast & Lightweight**: No dependencies, minimal footprint
- 🎨 **Customizable**: Control timing, characters, and animation behavior
- 📱 **Framework Agnostic**: Works with vanilla JS, React, Vue, Angular, etc.
- 🦾 **TypeScript**: Full type safety and IntelliSense support

## How It Works

Shiver Text creates a typewriter-style animation where characters are revealed one by one from left to right, while a few characters ahead scramble using random characters. HTML tags and entities are preserved during the animation.

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
<!-- Import shiver-text UMD build -->
<script src="https://cdn.jsdelivr.net/npm/shiver-text@latest/dist/index.js"></script>
<script>
  // ShiverText is available globally
  const shiverInstance = ShiverText.createShiverText("#my-element");
  shiverInstance.start();
</script>
```

For complete examples with different configurations, see the [examples/](examples/) folder.

### Preventing XSS: Using DOMPurify with shiver-text

When rendering user-provided HTML, always sanitize it before passing to shiver-text to prevent XSS vulnerabilities. Here is an example using [DOMPurify](https://github.com/cure53/DOMPurify):

```js
import DOMPurify from "dompurify";
import { createShiverText } from "shiver-text";

// Example: user-provided HTML
const userInput = '<span onclick="alert(1)">Hello <b>world</b>!</span>';

// Sanitize the input
const safeHTML = DOMPurify.sanitize(userInput);

// Pass the sanitized HTML to shiver-text
const shiver = createShiverText("#target-element");
shiver.setText(safeHTML);
```

This ensures only safe HTML is rendered and prevents malicious scripts from executing.

## Configuration Examples

### Matrix-Style Effect

```javascript
createShiverText("#element", {
  charset: "0123456789", // Numbers only
  duration: 80,
  delay: 30,
  scrambleRange: 5,
});
```

### Minimal Scramble

```javascript
createShiverText("#element", {
  scrambleRange: 1, // Only scramble 1 character ahead
  duration: 40, // Faster reveal
  delay: 20,
});
```

### Custom Character Set

```javascript
createShiverText("#element", {
  charset: "█▉▊▋▌▍▎▏", // Block characters for cyberpunk feel
  duration: 100,
  delay: 50,
  scrambleRange: 3,
});
```

### Slow Typewriter

```javascript
createShiverText("#element", {
  charset: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  duration: 200, // Longer settling time
  delay: 120, // More delay between characters
  scrambleRange: 2,
});
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

This library is compiled to ES2020 JavaScript, compatible with:

- Chrome >= 80
- Firefox >= 74
- Safari >= 13.1
- Edge >= 80

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please submit issues or open up a Pull Request.
