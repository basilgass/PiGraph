import { Path } from "@svgdotjs/svg.js";
import Graph from "./graphe";
export default class Plot {
    private _root;
    private _fx;
    private _steps;
    private _minX;
    private _maxX;
    private _shape;
    private _followPoint;
    private _tangent;
    private _tangentDX;
    private _tangentShow;
    private _precision;
    constructor(root: Graph, fx: Function, domain?: [number, number], steps?: number);
    private _checkFunction;
    private _evaluate;
    plot(fx?: Function, speed?: number): Plot;
    follow(showTangent?: Boolean): void;
    private _tangentPlot;
    get path(): string;
    get shape(): Path;
}
