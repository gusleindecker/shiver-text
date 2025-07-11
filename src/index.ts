export interface ShiverTextOptions {
  /** Duration for each character to settle (ms) */
  duration?: number;
  /** Characters to use for shuffling */
  charset?: string;
  /** Delay between each character starting (ms) */
  delay?: number;
  /** Number of characters to scramble after the last revealed one */
  scrambleRange?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback on each frame update */
  onUpdate?: (text: string) => void;
}

export interface ShiverTextInstance {
  start: () => void;
  stop: () => void;
  setText: (text: string, autoStart?: boolean) => void;
}

interface ShiverTextState {
  element: HTMLElement;
  originalText: string;
  options: Required<ShiverTextOptions>;
  animationId: number | null;
  startTime: number;
  isAnimating: boolean;
}

const defaultOptions: Required<ShiverTextOptions> = {
  duration: 60,
  charset:
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
  delay: 40,
  scrambleRange: 3,
  onComplete: () => {},
  onUpdate: () => {},
};

function createElement(element: HTMLElement | string): HTMLElement {
  const el =
    typeof element === "string"
      ? document.querySelector<HTMLElement>(element)
      : element;

  if (!el) {
    throw new Error(
      "Element not found! You need to provide an element that exists in your HTML for shiver-text to work."
    );
  }

  return el;
}

function mergeOptions(options: ShiverTextOptions): Required<ShiverTextOptions> {
  return { ...defaultOptions, ...options };
}

function getRandomChar(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

function createInitialState(
  element: HTMLElement | string,
  options: ShiverTextOptions = {}
): ShiverTextState {
  const el = createElement(element);
  return {
    element: el,
    originalText: el.textContent ?? "",
    options: mergeOptions(options),
    animationId: null,
    startTime: 0,
    isAnimating: false,
  };
}

function updateState<K extends keyof ShiverTextState>(
  state: ShiverTextState,
  updates: Pick<ShiverTextState, K>
): ShiverTextState {
  return { ...state, ...updates };
}

function stopAnimation(state: ShiverTextState): ShiverTextState {
  if (state.animationId) {
    cancelAnimationFrame(state.animationId);
  }
  return updateState(state, {
    animationId: null,
    isAnimating: false,
  });
}

function generateDisplayText(
  originalText: string,
  elapsed: number,
  options: Required<ShiverTextOptions>
): { text: string; allComplete: boolean } {
  let displayText = "";
  let revealedCount = 0;

  // First pass: count how many characters are fully revealed
  for (let i = 0, len = originalText.length; i < len; i++) {
    const char = originalText[i];

    if (char === " ") {
      revealedCount++;
      continue;
    }

    const charStartTime = i * options.delay;
    const charElapsed = Math.max(0, elapsed - charStartTime);

    if (charElapsed >= options.duration) {
      revealedCount++;
    } else {
      break; // Stop counting once we hit an unrevealed character
    }
  }

  // Second pass: build the display text
  for (let i = 0, len = originalText.length; i < len; i++) {
    const char = originalText[i];

    if (char === " ") {
      displayText += " ";
      continue;
    }

    const charStartTime = i * options.delay;
    const charElapsed = Math.max(0, elapsed - charStartTime);

    if (charElapsed >= options.duration) {
      // Character is fully revealed
      displayText += char;
    } else if (i < revealedCount + options.scrambleRange) {
      // Character is within the scrambling window
      displayText += getRandomChar(options.charset);
    }
    // Characters beyond the window are not added (effectively empty)
  }

  const allComplete = revealedCount === originalText.length;
  return { text: displayText, allComplete };
}

function createAnimationLoop(stateRef: { current: ShiverTextState }) {
  const animate = (): void => {
    if (!stateRef.current.isAnimating) return;

    const currentTime = performance.now();
    const elapsed = currentTime - stateRef.current.startTime;

    const { text: displayText, allComplete } = generateDisplayText(
      stateRef.current.originalText,
      elapsed,
      stateRef.current.options
    );

    stateRef.current.element.textContent = displayText;
    stateRef.current.options.onUpdate(displayText);

    if (allComplete) {
      stateRef.current = updateState(stateRef.current, { isAnimating: false });
      stateRef.current.options.onComplete();
    } else {
      const animationId = requestAnimationFrame(animate);
      stateRef.current = updateState(stateRef.current, { animationId });
    }
  };

  return animate;
}

export function createShiverText(
  element: HTMLElement | string,
  options: ShiverTextOptions = {}
): ShiverTextInstance {
  const stateRef = { current: createInitialState(element, options) };
  const animate = createAnimationLoop(stateRef);

  const start = (): void => {
    if (stateRef.current.isAnimating) {
      stateRef.current = stopAnimation(stateRef.current);
    }

    stateRef.current = updateState(stateRef.current, {
      isAnimating: true,
      startTime: performance.now(),
    });

    animate();
  };

  const stop = (): void => {
    stateRef.current = stopAnimation(stateRef.current);
  };

  const setText = (text: string, autoStart: boolean = true): void => {
    stateRef.current = updateState(stateRef.current, { originalText: text });
    if (autoStart) {
      start();
    }
  };

  return { start, stop, setText };
}
