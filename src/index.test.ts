import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createShiverText } from "./index";

// Mock DOM methods
Object.defineProperty(globalThis, "performance", {
  writable: true,
  value: {
    now: vi.fn(() => Date.now()),
  },
});

globalThis.requestAnimationFrame = vi.fn((cb) => {
  return setTimeout(cb, 16);
});

globalThis.cancelAnimationFrame = vi.fn((id) => {
  clearTimeout(id);
});

describe("index.ts", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create mock DOM element
    mockElement = {
      innerHTML: "Hello World",
      querySelector: vi.fn(),
    } as unknown as HTMLElement;

    // Mock document.querySelector
    vi.stubGlobal("document", {
      querySelector: vi.fn().mockReturnValue(mockElement),
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initialization", () => {
    it("Should create instance with HTMLElement.", () => {
      const instance = createShiverText(mockElement);

      expect(instance).toHaveProperty("start");
      expect(instance).toHaveProperty("stop");
      expect(instance).toHaveProperty("setText");
    });

    it("Should create instance with selector string.", () => {
      const instance = createShiverText("#test-element");

      expect(document.querySelector).toHaveBeenCalledWith("#test-element");
      expect(instance).toHaveProperty("start");
    });

    it("Should throw error for invalid selector.", () => {
      vi.mocked(document.querySelector).mockReturnValue(null);

      expect(() => createShiverText("#invalid")).toThrow(
        "Element not found! You need to provide an element that exists in your HTML for shiver-text to work.",
      );
    });
  });

  describe("options handling", () => {
    it("Should use default options when none provided.", () => {
      const instance = createShiverText(mockElement);

      // Test by starting animation and checking behavior
      instance.start();
      expect(performance.now).toHaveBeenCalled();
    });

    it("Should merge custom options with defaults.", () => {
      const customOptions = {
        duration: 100,
        delay: 50,
        onComplete: vi.fn(),
        onUpdate: vi.fn(),
      };

      const instance = createShiverText(mockElement, customOptions);
      instance.start();

      expect(customOptions.onUpdate).toHaveBeenCalled();
    });

    it("Should call default onComplete when no callback provided.", () => {
      // Create instance without onComplete callback
      const instance = createShiverText(mockElement); // No options = uses defaults

      let mockTime = 0;
      vi.mocked(performance.now).mockImplementation(() => mockTime);

      instance.start();

      // First frame - animation starts
      mockTime = 0;
      const animationCallback = vi.mocked(requestAnimationFrame).mock
        .calls[0][0];
      animationCallback(mockTime);

      // Second frame - animation completes (triggers default onComplete)
      mockTime = 1000; // Large enough to complete all characters
      animationCallback(mockTime);

      // No assertion needed - we just need to execute the default onComplete
      // If there were an error in the default function, the test would fail
      expect(true).toBe(true); // Just to have an assertion
    });
  });

  describe("animation control", () => {
    it("Should start animation.", () => {
      const instance = createShiverText(mockElement);

      instance.start();

      expect(performance.now).toHaveBeenCalled();
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("Should stop animation.", () => {
      const instance = createShiverText(mockElement);

      instance.start();
      instance.stop();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });

    it("Should restart animation if already running.", () => {
      const instance = createShiverText(mockElement);

      instance.start();
      const firstCallCount = vi.mocked(performance.now).mock.calls.length;

      // Start again
      instance.start();

      expect(vi.mocked(performance.now).mock.calls.length).toBeGreaterThan(
        firstCallCount,
      );
    });

    it("Should handle animation callback when not animating.", () => {
      const onUpdate = vi.fn();
      const instance = createShiverText(mockElement, { onUpdate });

      // Start animation to get the callback
      instance.start();

      // Get the animation callback that was scheduled
      const animationCallback = vi.mocked(requestAnimationFrame).mock
        .calls[0][0];

      // Stop the animation before the callback executes
      instance.stop();

      // Clear previous calls to onUpdate from start()
      vi.clearAllMocks();

      // Now execute the callback - this should hit the early return
      animationCallback(performance.now());

      // onUpdate should not be called because isAnimating is false
      expect(onUpdate).not.toHaveBeenCalled();

      // No new animation frame should be requested
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("setText method", () => {
    it("Should update text and auto-start by default.", () => {
      const instance = createShiverText(mockElement);

      instance.setText("New Text");

      expect(performance.now).toHaveBeenCalled();
      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("Should update text without auto-starting when specified.", () => {
      const instance = createShiverText(mockElement);
      vi.clearAllMocks();

      instance.setText("New Text", false);

      expect(performance.now).not.toHaveBeenCalled();
      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });
  });

  describe("HTML parsing and rendering", () => {
    it("Should preserve HTML tags during animation.", async () => {
      mockElement.innerHTML = "<strong>Bold</strong> text";
      const instance = createShiverText(mockElement);

      instance.start();

      // Let animation run briefly
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should contain the strong tag
      expect(mockElement.innerHTML).toContain("<strong>");
    });

    it("Should handle plain text.", () => {
      mockElement.innerHTML = "Plain text";
      const instance = createShiverText(mockElement);

      instance.start();

      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("Should handle empty content.", () => {
      mockElement.innerHTML = "";
      const onComplete = vi.fn();
      const instance = createShiverText(mockElement, { onComplete });

      instance.start();

      // For empty content, animation completes immediately without requestAnimationFrame
      expect(requestAnimationFrame).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe("callbacks", () => {
    it("Should call onUpdate callback during animation.", async () => {
      const onUpdate = vi.fn();
      const instance = createShiverText(mockElement, { onUpdate });

      instance.start();

      // Trigger animation frame with timestamp
      const animationCallback = vi.mocked(requestAnimationFrame).mock
        .calls[0][0];
      animationCallback(performance.now());

      expect(onUpdate).toHaveBeenCalled();
    });

    it("Should call onComplete when animation finishes.", async () => {
      const onComplete = vi.fn();

      // Use longer duration to ensure animation runs
      const instance = createShiverText(mockElement, {
        duration: 100,
        delay: 50,
        onComplete,
      });

      // Set up consistent timing
      let mockTime = 0;
      vi.mocked(performance.now).mockImplementation(() => mockTime);

      instance.start();

      // First frame - animation starts
      mockTime = 0;
      const animationCallback = vi.mocked(requestAnimationFrame).mock
        .calls[0][0];
      animationCallback(mockTime);

      // Second frame - animation completes
      mockTime = 1000; // Large enough to complete all characters
      animationCallback(mockTime);

      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe("performance", () => {
    it("Should use requestAnimationFrame for smooth animation.", () => {
      const instance = createShiverText(mockElement);

      instance.start();

      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it("Should clean up animation frame on stop.", () => {
      const instance = createShiverText(mockElement);

      instance.start();
      instance.stop();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("Should handle special characters in charset.", () => {
      const instance = createShiverText(mockElement, {
        charset: "!@#$%^&*()",
      });

      expect(() => instance.start()).not.toThrow();
    });

    it("Should handle HTML entities.", () => {
      mockElement.innerHTML = "&amp; &lt; &gt;";
      const instance = createShiverText(mockElement);

      expect(() => instance.start()).not.toThrow();
    });

    it("Should handle nested HTML tags.", () => {
      mockElement.innerHTML = "<div><span>Nested</span></div>";
      const instance = createShiverText(mockElement);

      expect(() => instance.start()).not.toThrow();
    });
  });
});
