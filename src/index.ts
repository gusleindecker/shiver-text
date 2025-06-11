export interface ShiverTextOptions {
  /** Duration for each character to settle (ms) */
  duration?: number;
  /** Characters to use for shuffling */
  charset?: string;
  /** Delay between each character starting (ms) */
  delay?: number;
  /** Callback when animation completes */
  onComplete?: () => void;
  /** Callback on each frame update */
  onUpdate?: (text: string) => void;
}

export class ShiverText {
  private element: HTMLElement;
  private originalText: string;
  private options: Required<ShiverTextOptions>;
  private animationId: number | null = null;
  private startTime: number = 0;
  private isAnimating: boolean = false;

  constructor(element: HTMLElement | string, options: ShiverTextOptions = {}) {
    this.element =
      typeof element === "string"
        ? (document.querySelector(element) as HTMLElement)
        : element;

    if (!this.element) {
      throw new Error("Element not found");
    }

    this.originalText = this.element.textContent || "";
    this.options = {
      duration: 60,
      charset:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?",
      delay: 40,
      onComplete: () => {},
      onUpdate: () => {},
      ...options,
    };
  }

  /**
   * Start the shuffle animation
   */
  start(): void {
    if (this.isAnimating) {
      this.stop();
    }

    this.isAnimating = true;
    this.startTime = performance.now();
    this.animate();
  }

  /**
   * Stop the animation
   */
  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isAnimating = false;
  }

  /**
   * Set new text and optionally start animation
   */
  setText(text: string, autoStart: boolean = true): void {
    this.originalText = text;
    if (autoStart) {
      this.start();
    }
  }

  /**
   * Get a random character from the charset
   */
  private getRandomChar(): string {
    return this.options.charset[
      Math.floor(Math.random() * this.options.charset.length)
    ];
  }

  /**
   * Main animation loop
   */
  private animate = (): void => {
    if (!this.isAnimating) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.startTime;

    let displayText = "";
    let allComplete = true;

    for (let i = 0; i < this.originalText.length; i++) {
      const char = this.originalText[i];

      // Skip spaces - they appear immediately
      if (char === " ") {
        displayText += " ";
        continue;
      }

      const charStartTime = i * this.options.delay;
      const charElapsed = Math.max(0, elapsed - charStartTime);

      if (charElapsed >= this.options.duration) {
        // Character is complete
        displayText += char;
      } else if (charElapsed > 0) {
        // Character is animating
        displayText += this.getRandomChar();
        allComplete = false;
      } else {
        // Character hasn't started yet
        displayText += this.getRandomChar();
        allComplete = false;
      }
    }

    // Update the element
    this.element.textContent = displayText;
    this.options.onUpdate(displayText);

    if (allComplete) {
      this.isAnimating = false;
      this.options.onComplete();
    } else {
      this.animationId = requestAnimationFrame(this.animate);
    }
  };
}

/**
 * Convenience function to create and start a shiver effect
 */
export function shiverText(
  element: HTMLElement | string,
  text?: string,
  options?: ShiverTextOptions
): ShiverText {
  const shiverer = new ShiverText(element, options);

  if (text) {
    shiverer.setText(text);
  } else {
    shiverer.start();
  }

  return shiverer;
}
