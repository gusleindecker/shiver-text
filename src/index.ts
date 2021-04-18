export default class ShiverText {
  /**
   * The characters used to produce the effect.
   *
   * @memberof ShiverText
   */
  public randomCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890█+÷~.–<>/\\{}';

  /**
   * The element that contains the text to be animated.
   *
   * @private
   * @type {HTMLElement}
   * @memberof ShiverText
   */
  private element: HTMLElement;

  /**
   * The array that stores the text separated by lines as it appears
   * on the screen.
   *
   * @private
   * @type {string[]}
   * @memberof ShiverText
   */
  private textLines: string[] = [];

  private timeStart = 0;
  private requestAnimationFrameId = 0;

  constructor(element: HTMLElement) {
    this.element = element;
    this.setTextLines(element.childNodes[0]);
  }

  public start(): void {
    this.requestAnimationFrameId = window.requestAnimationFrame(this.step.bind(this));
  }

  private setTextLines(node: Node): void {
    if (!node || !node.parentNode || node.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const range = document.createRange();
    range.setStart(node, 0);
    let prevBottom = range.getBoundingClientRect().bottom;
    const str = node.textContent ?? '';
    let current = 1; // we already got index 0
    let lastFound = 0;
    let bottom = 0;

    console.log('prevBottom:', prevBottom);
    // iterate over all characters
    while (current <= str.length) {
      // move our cursor
      range.setStart(node, current);
      if (current < str.length - 1) {
        range.setEnd(node, current + 1);
      }
      bottom = range.getBoundingClientRect().bottom;
      if (bottom > prevBottom) {
        // line break
        this.textLines.push(str.substr(lastFound, current - lastFound));
        prevBottom = bottom;
        lastFound = current;
      }
      current++;
    }
    // push the last line
    this.textLines.push(str.substr(lastFound));
  }

  private step(timeStamp: DOMHighResTimeStamp): void {
    if (this.timeStart === 0) {
      this.timeStart = timeStamp;
    }
    const timeElapsed = timeStamp - this.timeStart;

    // `Math.min()` is used here to make sure that the element stops at exactly 200px.
    this.element.style.transform = 'translateX(' + Math.min(0.1 * timeElapsed, 200) + 'px)';

    // Stop the animation after 2 seconds
    if (timeElapsed < 2000) {
      this.requestAnimationFrameId = window.requestAnimationFrame(this.step.bind(this));
    }
  }
}
