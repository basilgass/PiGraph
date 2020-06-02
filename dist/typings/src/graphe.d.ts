import { Svg } from "@svgdotjs/svg.js";
import Plot from "./plot";
import { IPoint } from "./main";
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
    private _createMarker;
    add(fx: Function, domain?: [number, number], steps?: number): Plot;
    showAxis(): Graph;
    showXAxis(show?: Boolean): Graph;
    showYAxis(show?: Boolean): Graph;
    get svg(): Svg;
    get minX(): number;
    get maxX(): number;
    get minY(): number;
    get maxY(): number;
    get dx(): number;
    get dy(): number;
    get ppcm(): number;
    set ppcm(value: number);
    get origin(): IPoint;
    set origin(value: IPoint);
    get width(): number;
    get height(): number;
}
