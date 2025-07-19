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

interface ParsedContent {
  type: "tag" | "space" | "character";
  content: string;
}

interface ShiverTextState {
  element: HTMLElement;
  originalHTML: string;
  parsedContent: ParsedContent[];
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

function parseHTML(html: string): ParsedContent[] {
  const array: ParsedContent[] = [];
  const tagRegex = /^(\s*)?<\/?[a-z][^>]*>(\s*)?/i;
  const spaceRegex = /^\s+/;

  let string = html.replace(/^\s+/, "").replace(/\s+$/, "");

  while (string.length !== 0) {
    const matchTag = string.match(tagRegex);

    if (matchTag) {
      array.push({
        type: "tag",
        content: matchTag[0],
      });
      string = string.replace(matchTag[0], "");
      continue;
    }

    const matchSpace = string.match(spaceRegex);

    if (matchSpace) {
      array.push({
        type: "space",
        content: " ",
      });
      string = string.replace(matchSpace[0], "");
      continue;
    }

    array.push({
      type: "character",
      content: string[0],
    });
    string = string.slice(1);
  }

  return array;
}

function createInitialState(
  element: HTMLElement | string,
  options: ShiverTextOptions = {}
): ShiverTextState {
  const el = createElement(element);
  const originalHTML = el.innerHTML;

  return {
    element: el,
    originalHTML,
    parsedContent: parseHTML(originalHTML),
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

function generateDisplayHTML(
  parsedContent: ParsedContent[],
  elapsed: number,
  options: Required<ShiverTextOptions>
): { html: string; allComplete: boolean } {
  const parsedContentLength = parsedContent.length;
  let displayHTML = "";
  let characterIndex = 0;
  let revealedCount = 0;

  // First pass: count revealed characters
  for (let i = 0; i < parsedContentLength; i++) {
    const item = parsedContent[i];
    if (item.type === "character") {
      const charStartTime = characterIndex * options.delay;
      const charElapsed = Math.max(0, elapsed - charStartTime);

      if (charElapsed >= options.duration) {
        revealedCount++;
      } else {
        break;
      }
      characterIndex++;
    }
  }

  // Second pass: build display HTML
  characterIndex = 0;
  for (let i = 0; i < parsedContentLength; i++) {
    const item = parsedContent[i];
    if (item.type === "tag" || item.type === "space") {
      displayHTML += item.content;
    } else if (item.type === "character") {
      const charStartTime = characterIndex * options.delay;
      const charElapsed = Math.max(0, elapsed - charStartTime);

      if (charElapsed >= options.duration) {
        // Character is fully revealed
        displayHTML += item.content;
      } else if (characterIndex < revealedCount + options.scrambleRange) {
        // Character is within the scrambling window
        displayHTML += getRandomChar(options.charset);
      }
      // Characters beyond the window are not added

      characterIndex++;
    }
  }

  const totalCharacters = parsedContent.filter(
    (item) => item.type === "character"
  ).length;
  const allComplete = revealedCount === totalCharacters;

  return { html: displayHTML, allComplete };
}

function createAnimationLoop(stateRef: { current: ShiverTextState }) {
  const animate = (): void => {
    if (!stateRef.current.isAnimating) return;

    const currentTime = performance.now();
    const elapsed = currentTime - stateRef.current.startTime;

    const { html: displayHTML, allComplete } = generateDisplayHTML(
      stateRef.current.parsedContent,
      elapsed,
      stateRef.current.options
    );

    stateRef.current.element.innerHTML = displayHTML;
    stateRef.current.options.onUpdate(displayHTML);

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
    const parsedContent = parseHTML(text);
    stateRef.current = updateState(stateRef.current, {
      originalHTML: text,
      parsedContent,
    });
    if (autoStart) {
      start();
    }
  };

  return { start, stop, setText };
}
