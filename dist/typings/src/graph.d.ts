import { Circle, Marker, Svg } from "@svgdotjs/svg.js";
import Plot from "./plot";
import { IPoint } from "./main";
import Axis from "./axis";
/**
 * Create the arrow markers for the axis.
 * @param scale
 * @private
 */
export declare function createMarker(svg: Svg, scale: number): {
    start: Marker;
    end: Marker;
};
export default class Graph {
    private _container;
    private _svgWrapper;
    private _draw;
    private _width;
    private _height;
    private _origin;
    private _ppcm;
    private _svgXAxis;
    private _svgYAxis;
    private _marker;
    private _dx;
    private _dy;
    private _plots;
    private _xAxis;
    private _yAxis;
    constructor(containerID: string | HTMLElement, width: number, height: number, xAxis: {
        min: number;
        max: number;
    } | number, yAxis: {
        min: number;
        max: number;
    } | number, origin: {
        x: number;
        y: number;
    });
    /**
     * Add a new function
     * @param fx
     * @param domain
     * @param steps
     */
    plot(fx: string, domain?: [number, number], steps?: number): Plot;
    addPlot(fx: string, domain?: [number, number], steps?: number): Graph;
    point(x: number, y: number, radius?: number): Circle;
    addPoint(x: number, y: number, radius?: number): Graph;
    clearPlots(): Graph;
    getPlot(id: number): any;
    /**
     * Calculate axis coordinate to svg coordinate.
     */
    getSvgCoordinate(x: number, y: number): {
        x: number;
        y: number;
    };
    /**
     * Add a vertical asymptote
     */
    addVerticalLine(x: number): Plot;
    /**
     * Display the X and Y axis.
     */
    showAxis(): Graph;
    /**
     * Display grid
     */
    showGrid(show?: boolean): Graph;
    gridDividers(dividers: number): Graph;
    /**
     * Function to determiner the scale of stroke
     */
    strokeWidth(factor?: number): number;
    /**
     * Return the svg (from svg.js) element
     */
    get svg(): Svg;
    /**
     * Get the minimum value displayed in the graph on the yAxis.
     */
    get minX(): number;
    /**
     * Get the max value displayed in the graph on the xAxis.
     */
    get maxX(): number;
    /**
     * Get the min value displayed in the graph on the yAxis.
     */
    get minY(): number;
    /**
     * Get the max value displayed in the graph on the yAxis.
     */
    get maxY(): number;
    get dx(): number;
    get dy(): number;
    /**
     * Get the number of pixels per centimeters
     */
    get ppcm(): number;
    /**
     * Set the number of pixels per centimeter
     * @param value
     */
    set ppcm(value: number);
    /**
     * Get the coordinate of the origin of the axes
     */
    get origin(): IPoint;
    /**
     * Set the coordinate of the origin of the axes
     */
    set origin(value: IPoint);
    /**
     * Canvas width
     */
    get width(): number;
    /**
     * Canvas height
     */
    get height(): number;
    get xAxis(): Axis;
    get yAxis(): Axis;
}
