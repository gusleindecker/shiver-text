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
  setText: (textOrHtml: string, autoStart?: boolean) => void;
}

interface ParsedContent {
  type: "tag" | "space" | "character";
  content: string;
}

interface ParsedResult {
  content: ParsedContent[];
  totalCharacters: number;
}

interface ShiverTextState {
  element: HTMLElement;
  originalHTML: string;
  parsedResult: ParsedResult;
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

function parseHTML(html: string): ParsedResult {
  /**
   * Improved HTML parser:
   * - Preserves leading/trailing whitespace
   * - Enhanced tag regex to match comments, CDATA, DOCTYPE, and self-closing tags
   * - Handles HTML entities
   * - Caches character count during parsing
   *
   * Limitations: Does not fully parse nested tags, comments, CDATA, or DOCTYPE. For robust parsing, use a dedicated HTML parser library.
   */
  const array: ParsedContent[] = [];
  let totalCharacters = 0;

  // Matches tags, comments, CDATA, DOCTYPE, and self-closing tags
  const tagRegex =
    /^(<\/?[a-zA-Z][^>]*>|<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)\]\]>|<!DOCTYPE[^>]*>)/i;
  // Matches HTML entities
  const entityRegex = /^&[a-zA-Z0-9#]+;/;
  // Matches whitespace
  const spaceRegex = /^\s+/;

  let string = html;

  while (string.length !== 0) {
    const matchTag = string.match(tagRegex);
    if (matchTag) {
      array.push({
        type: "tag",
        content: matchTag[0],
      });
      string = string.slice(matchTag[0].length);
      continue;
    }

    const matchEntity = string.match(entityRegex);
    if (matchEntity) {
      array.push({
        type: "character",
        content: matchEntity[0],
      });
      totalCharacters++;
      string = string.slice(matchEntity[0].length);
      continue;
    }

    const matchSpace = string.match(spaceRegex);

    if (matchSpace) {
      array.push({
        type: "space",
        content: matchSpace[0],
      });
      string = string.slice(matchSpace[0].length);
      continue;
    }

    // Single character fallback
    array.push({
      type: "character",
      content: string[0],
    });
    totalCharacters++;
    string = string.slice(1);
  }

  return { content: array, totalCharacters };
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
    parsedResult: parseHTML(originalHTML),
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
  parsedResult: ParsedResult,
  elapsed: number,
  options: Required<ShiverTextOptions>
): { html: string; allComplete: boolean } {
  const { content: parsedContent, totalCharacters } = parsedResult;
  const parsedContentLength = parsedContent.length;
  const htmlParts: string[] = [];
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
  /**
   * SECURITY WARNING: The generated HTML is rendered using innerHTML.
   * Only trusted HTML should be used. If you accept user-provided content,
   * sanitize it before passing to shiver-text to prevent XSS vulnerabilities.
   * Consider using a library like DOMPurify for sanitization.
   */
  characterIndex = 0;
  for (let i = 0; i < parsedContentLength; i++) {
    const item = parsedContent[i];
    if (item.type === "tag" || item.type === "space") {
      htmlParts.push(item.content);
    } else if (item.type === "character") {
      const charStartTime = characterIndex * options.delay;
      const charElapsed = Math.max(0, elapsed - charStartTime);

      if (charElapsed >= options.duration) {
        // Character is fully revealed
        htmlParts.push(item.content);
      } else if (characterIndex < revealedCount + options.scrambleRange) {
        // Character is within the scrambling window
        htmlParts.push(getRandomChar(options.charset));
      }
      // Characters beyond the window are not added

      characterIndex++;
    }
  }

  const allComplete = revealedCount === totalCharacters;

  return { html: htmlParts.join(""), allComplete };
}

function createAnimationLoop(stateRef: { current: ShiverTextState }) {
  const animate = (): void => {
    if (!stateRef.current.isAnimating) return;

    const currentTime = performance.now();
    const elapsed = currentTime - stateRef.current.startTime;

    const { html: displayHTML, allComplete } = generateDisplayHTML(
      stateRef.current.parsedResult,
      elapsed,
      stateRef.current.options
    );

    /**
     * SECURITY WARNING: Rendering with innerHTML can expose your app to XSS attacks
     * if untrusted HTML is passed. Always sanitize user-provided content before rendering.
     * Consider using a library like DOMPurify, or a safer rendering method for untrusted content.
     */
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

  const setText = (textOrHtml: string, autoStart: boolean = true): void => {
    const parsedResult = parseHTML(textOrHtml);
    stateRef.current = updateState(stateRef.current, {
      originalHTML: textOrHtml,
      parsedResult,
    });
    if (autoStart) {
      start();
    }
  };

  return { start, stop, setText };
}
