import { Path } from "@svgdotjs/svg.js";
import Graph from "./graph";
export default class Plot {
    private _root;
    private _fx;
    private _asymptote;
    private _steps;
    private _minX;
    private _maxX;
    private _followPoint;
    private _tangent;
    private _tangentDX;
    private _tangentShow;
    private _precision;
    private _shapeGroup;
    private _histFrequency;
    constructor(root: Graph, fx: string, domain?: [number, number], steps?: number);
    private _shape;
    get shape(): Path;
    get path(): string;
    plotFunction(speed?: number): Plot;
    plotAsymptote(speed?: number): Plot;
    hist(data: number[], labels: any[]): Plot;
    histFrequency(show?: boolean): Plot;
    mustache(data: {
        x1: number;
        x2: number;
        x3: number;
        minX: number;
        maxX: number;
        height?: number;
        width?: number;
        horizontal?: boolean;
        factor?: number;
    }): Plot;
    plot(speed?: number): Plot;
    updatePlot(fx: string, speed?: number): Plot;
    samples(samples: number): Plot;
    follow(showTangent?: Boolean): Plot;
    dash(value: number | string): Plot;
    color(value: string): Plot;
    width(value: number): Plot;
    private _evaluate;
    private _evaluateCoord;
    private parseFx;
    private _tangentPlot;
}
