import {Circle, Line, Marker, SVG, Svg} from "@svgdotjs/svg.js";
import Plot from "./plot";
import {IPoint} from "./main";
import Axis from "./axis";
import {evaluate} from "mathjs";

/**
 * Create the arrow markers for the axis.
 * @param scale
 * @private
 */
export function createMarker (svg:Svg, scale: number) :{start: Marker, end: Marker}{
    const marker:{start: Marker, end: Marker} = {
        start: null,
        end: null
    };

    marker.start = svg.marker(
        scale,
        scale,
        function (add:Marker) {
            add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`).rotate(180)
        }).ref(0, scale / 2);
    marker.end = svg.marker(
        scale,
        scale,
        function (add:Marker) {
            add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`)
        }).ref(scale, scale / 2);

    return marker;
}

export default class Graph {
    private _container: HTMLElement;
    private _svgWrapper: HTMLElement;
    private _draw: Svg;
    private _width: number;
    private _height: number;
    private _origin: IPoint
    private _ppcm: number;
    private _svgXAxis: Line;
    private _svgYAxis: Line;
    private _marker: { start: Marker, end: Marker };
    private _dx: number;
    private _dy: number;
    private _plots: any[];

    private _xAxis: Axis;
    private _yAxis: Axis;

    constructor(
        containerID: string | HTMLElement,
        width: number,
        height: number,
        xAxis: { min: number, max: number } | number,
        yAxis: { min: number, max: number } | number,
        origin: { x: number, y: number }
    ) {
        if (typeof containerID === 'string') {
            this._container = document.getElementById(containerID);
        } else {
            this._container = containerID;
        }

        this._svgWrapper = document.createElement('DIV');
        this._svgWrapper.style.position = 'relative';
        this._svgWrapper.style.width = '100%';
        this._svgWrapper.style.height = '100%';
        this._container.appendChild(this._svgWrapper);

        this._dx = +width;
        this._dy = +height;
        this._ppcm = 100;
        this._width = this.dx * this._ppcm;
        this._height = this.dy * this._ppcm;
        this._draw = SVG().addTo(this._svgWrapper).size('100%', '100%');
        this._draw.viewbox(0, 0, this._width, this._height);
        this._plots = [];

        this._origin = {
            x: 1,
            y: 1
        }

        this._xAxis = new Axis(this).horizontal();
        this._yAxis = new Axis(this).vertical();
        this.showAxis();
    }
    /**
     * Add a new function
     * @param fx
     * @param domain
     * @param steps
     */
    plot(fx: string, domain?: [number, number], steps?: number, ):Plot {
        let p = new Plot(this, fx, domain, steps);
        this._plots.push(p);
        return p;
    }

    addPlot(fx: string, domain?: [number, number], steps?: number):Graph {
        this.plot(fx, domain, steps);
        return this;
    }

    point(x: number, y: number, radius?:number):Circle{
        let circle = this.svg.circle(this.strokeWidth(radius?radius:5))
                .stroke({color: 'black', width: this.strokeWidth(0.5)})
                .fill('white'),
            pt = this.getSvgCoordinate(x, y);

        circle.center(pt.x, pt.y);
        this._plots.push(circle);
        return circle;
    }
    addPoint(x:number, y:number, radius?:number):Graph{
        this.point(x, y, radius);
        return this;
    }

    clearPlots():Graph {
        for(let i=0; i<this._plots.length; i++){
            if(this._plots[i].shape===undefined){
                this._plots[i].remove();
            }else {
                this._plots[i].shape.remove();
            }
        }
        return this;
    }
    getPlot(id: number):any{
        if(this._plots.length>id){
            return this._plots[id];
        }else{
            return null;
        }
    }

    /**
     * Calculate axis coordinate to svg coordinate.
     */
    getSvgCoordinate(x: number, y: number):{x: number, y: number}{
        return {
            x: (this.origin.x + x) * this.ppcm,
            y: (this.origin.y - y) * this.ppcm
        }
    }
    /**
     * Add a vertical asymptote
     */
    addVerticalLine(x: number):Plot{
        return new Plot(this, `x=${x}`);
    }

    /**
     * Display the X and Y axis.
     */
    showAxis(): Graph {
        this._xAxis.update();
        this._yAxis.update();
        return this;
    }

    /**
     * Display grid
     */
    showGrid(show?:boolean): Graph{
        this._xAxis.showGrid(show);
        this._yAxis.showGrid(show);
        return this;
    }

    gridDividers(dividers: number): Graph {
        this._xAxis.gridDividers = dividers;
        this._yAxis.gridDividers = dividers;
        return this;
    }

    /**
     * Function to determiner the scale of stroke
     */
    strokeWidth(factor?:number):number{
        let strokeSize = (factor===undefined)?1:factor;
        return factor*this._width/this._container.offsetWidth
    }

    /**
     * Return the svg (from svg.js) element
     */
    get svg(): Svg {
        return this._draw;
    }

    /**
     * Get the minimum value displayed in the graph on the yAxis.
     */
    get minX(): number {
        return -this._origin.x
    }

    /**
     * Get the max value displayed in the graph on the xAxis.
     */

    get maxX(): number {
        return this._dx - this._origin.x
    }

    /**
     * Get the min value displayed in the graph on the yAxis.
     */
    get minY(): number {
        return -this._origin.y
    }

    /**
     * Get the max value displayed in the graph on the yAxis.
     */
    get maxY(): number {
        return this._dy - this._origin.y
    }

    get dx(): number {
        return this._dx;
    }

    get dy(): number {
        return this._dy;
    }

    /**
     * Get the number of pixels per centimeters
     */
    get ppcm(): number {
        return this._ppcm;
    }

    /**
     * Set the number of pixels per centimeter
     * @param value
     */
    set ppcm(value: number) {
        this._ppcm = value;
    }

    /**
     * Get the coordinate of the origin of the axes
     */
    get origin(): IPoint {
        return this._origin;
    }

    /**
     * Set the coordinate of the origin of the axes
     */
    set origin(value: IPoint) {
        this._origin = value;
        this.showAxis();
    }

    /**
     * Canvas width
     */
    get width(): number {
        return this._width;
    }

    /**
     * Canvas height
     */
    get height(): number {
        return this._height;
    }


    get xAxis(): Axis {
        return this._xAxis;
    }

    get yAxis(): Axis {
        return this._yAxis;
    }
};