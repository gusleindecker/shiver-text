# Shiver Text

A TypeScript library for creating a smooth shiver/shuffling animation to your text. Perfect for creating engaging text reveals with a cyberpunk/glitch feel.

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

### Basic Usage

```typescript
import { shiverText } from 'shiver-text';

// Basic usage with default options
shiverText('#my-element', 'Hello World!');

// Or with an element reference
const element = document.getElementById('my-element');
shiverText(element, 'Hello World!');
```

### Advanced Usage

```typescript
import { ShiverText } from 'shiver-text';

const element = document.querySelector('.title');
const shiverer = new ShiverText(element, {
  duration: 80,        // Time for each character to settle (ms)
  delay: 50,          // Delay between each character starting (ms)
  charset: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
  onComplete: () => {
    console.log('Animation complete!');
  },
  onUpdate: (currentText) => {
    console.log('Current text:', currentText);
  }
});

// Start the animation
shiverer.start();

// Change text and animate
shiverer.setText('New text to animate');

// Stop animation
shiverer.stop();
```

## API Reference

### `shiverText(element, text?, options?)`

Convenience function to create and start a shiver animation.

**Parameters:**
- `element: HTMLElement | string` - DOM element or selector
- `text: string` (optional) - Text to animate to
- `options: ShiverTextOptions` (optional) - Animation options

**Returns:** `ShiverText` instance

### `new ShiverText(element, options?)`

Create a new ShiverText instance.

**Parameters:**
- `element`: `HTMLElement | string` - DOM element or selector
- `options`: `ShiverTextOptions` (optional) - Animation options

### Options

```typescript
interface ShiverTextOptions {
  /** Duration for each character to settle (ms) - default: 60 */
  duration?: number;
  
  /** Characters to use for shuffling - default: alphanumeric + symbols */
  charset?: string;
  
  /** Delay between each character starting (ms) - default: 40 */
  delay?: number;
  
  /** Callback when animation completes */
  onComplete?: () => void;
  
  /** Callback on each frame update */
  onUpdate?: (text: string) => void;
}
```

### Methods

- `start()`: Start the shiver animation
- `stop()`: Stop the current animation
- `setText(text, autoStart?)`: Set new text and optionally start animation

## Examples

### React Component

```tsx
import React, { useEffect, useRef } from 'react';
import { ShiverText } from '@yourusername/shiver-text';

const ShiverTextComponent: React.FC<{ text: string }> = ({ text }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const shivererRef = useRef<ShiverText | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      shivererRef.current = new ShiverText(elementRef.current, {
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
<template>
  <div ref="textElement" class="shiver-text"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { ShiverText } from '@yourusername/shiver-text';

interface Props {
  text: string;
}

const props = defineProps<Props>();
const textElement = ref<HTMLElement>();
let shiverer: ShiverText | null = null;

onMounted(() => {
  if (textElement.value) {
    shiverer = new ShiverText(textElement.value);
    shiverer.setText(props.text);
  }
});

onUnmounted(() => {
  shiverer?.stop();
});

watch(() => props.text, (newText) => {
  shiverer?.setText(newText);
});
</script>
```

### Custom Styling

```css
.shiver-text {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
  background: #000;
  padding: 1rem;
}
```

## Browser Support

- Chrome/Edge 61+
- Firefox 55+
- Safari 10.1+
- All modern browsers with `requestAnimationFrame` support

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.