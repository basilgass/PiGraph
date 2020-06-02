import {Line, Marker, SVG, Svg} from "@svgdotjs/svg.js";
import Plot from "./plot";
import {IPoint} from "./main";

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

        this._origin = {
            x: 1,
            y: 1
        }

        this._createMarker(20)
        this.showAxis();

    }

    private _createMarker(scale: number) {
        this._marker = {
            start: null,
            end: null
        };

        this._marker.start = this.svg.marker(
            scale,
            scale,
            function (add) {
                add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`).rotate(180)
            }).ref(0, scale / 2);
        this._marker.end = this.svg.marker(
            scale,
            scale,
            function (add) {
                add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`)
            }).ref(scale, scale / 2);
    }

    add(fx: Function, domain?: [number, number], steps?: number, ) {
        return new Plot(this, fx, domain, steps);
    }

    showAxis(): Graph {
        this.showXAxis();
        this.showYAxis();
        return this;
    }

    showXAxis(show?: Boolean): Graph {
        if (this._svgXAxis === undefined) {
            this._svgXAxis = this.svg.line(0, 0, 0, 0).stroke({color: 'black', width: 1});
            this._svgXAxis.marker('end', this._marker.end)
        }

        this._svgXAxis.plot(
            (this._origin.x + this.minX + 0.2) * this._ppcm,
            this._height - this._origin.y * this._ppcm,
            (this._origin.x + this.maxX - 0.2) * this._ppcm,
            this._height - this._origin.y * this._ppcm
        )


        if (show === false) {
            this._svgXAxis.hide()
        }
        return this;
    }

    showYAxis(show?: Boolean): Graph {
        if (this._svgYAxis === undefined) {
            this._svgYAxis = this.svg.line(0, 0, 0, 0).stroke({color: 'black', width: 1});
            this._svgYAxis.marker('end', this._marker.end)
        }

        this._svgYAxis.plot(
            this._origin.x * this._ppcm,
            this._height - (this._origin.y + this.minY + 0.2) * this._ppcm,
            this._origin.x * this._ppcm,
            this._height - (this._origin.y + this.maxY - 0.2) * this._ppcm
        )


        if (show === false) {
            this._svgYAxis.hide()
        }
        return this;
    }

    get svg(): Svg {
        return this._draw;
    }

    get minX(): number {
        return -this._origin.x
    }

    get maxX(): number {
        return this._dx - this._origin.x
    }

    get minY(): number {
        return -this._origin.y
    }

    get maxY(): number {
        return this._dy - this._origin.y
    }

    get dx(): number {
        return this._dx;
    }

    get dy(): number {
        return this._dy;
    }


    get ppcm(): number {
        return this._ppcm;
    }

    set ppcm(value: number) {
        this._ppcm = value;
    }

    get origin(): IPoint {
        return this._origin;
    }

    set origin(value: IPoint) {
        this._origin = value;
        this.showAxis();
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }
};