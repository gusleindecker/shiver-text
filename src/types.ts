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

export interface ShiverTextParsedContent {
  type: "tag" | "space" | "character";
  content: string;
}

export interface ShiverTextParsedResult {
  content: ShiverTextParsedContent[];
  totalCharacters: number;
}

export interface ShiverTextState {
  element: HTMLElement;
  originalHTML: string;
  parsedResult: ShiverTextParsedResult;
  options: Required<ShiverTextOptions>;
  animationId: number | null;
  startTime: number;
  isAnimating: boolean;
}
