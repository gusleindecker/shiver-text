export default class ShiverText {
    /**
     * The characters used to produce the effect.
     *
     * @memberof ShiverText
     */
    randomCharacters: string;
    /**
     * The element that contains the text to be animated.
     *
     * @private
     * @type {HTMLElement}
     * @memberof ShiverText
     */
    private element;
    /**
     * The array that stores the text separated by lines as it appears
     * on the screen.
     *
     * @private
     * @type {string[]}
     * @memberof ShiverText
     */
    private textLines;
    private timeStart;
    private requestAnimationFrameId;
    constructor(element: HTMLElement);
    start(): void;
    private setTextLines;
    private step;
}
