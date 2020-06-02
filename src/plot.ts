import {Circle, Line, Path} from "@svgdotjs/svg.js";
import {IPoint} from "./main";
import Graph from "./graphe";

export default class Plot {
    private _root: Graph;
    private _fx: Function
    private _steps: number
    private _minX: number
    private _maxX: number
    private _shape: Path;
    private _followPoint: Circle;
    private _tangent: Line;
    private _tangentDX: number;
    private _tangentShow: Boolean;
    private _precision: number;

    constructor(root: Graph, fx: Function, domain?: [number, number], steps?: number) {
        this._root = root;
        this._fx = fx;
        this._steps = steps === undefined ? 0.025: +steps;
        this._minX = domain === undefined ? this._root.minX : domain[0];
        this._maxX = domain === undefined ? this._root.maxX : domain[1];

        this._precision = 2;
        this._tangentShow = false;
        this._tangentDX = 0.000001;

        //this._shape = root.svg.polyline().stroke('black').fill('none');
        this._shape = root.svg.path().stroke('black').fill('none');
        this.plot();
        return this;
    }

    private _checkFunction(fx: Function): Function {
        try {
            let y = fx(0);
            if (typeof y !== "number") {
                console.log('Function does not return a number')
                return this._fx;
            }

            return fx;
        } catch {
            return this._fx;
        }
    }

    private _evaluate(x: number, fx?: Function): IPoint {

        if (fx === undefined) {
            fx = this._fx;
        }

        return {
            x: (this._root.origin.x + x) * this._root.ppcm,
            y: (this._root.origin.y - fx(x)) * this._root.ppcm
        }
    }

    plot(fx?: Function, speed?: number): Plot {
        if (fx !== undefined) {
            this._fx = this._checkFunction(fx);
        }

        let points = [],
            d = ``,
            nextToken = 'M',
            prevToken = '',
            x = +this._minX,
            HeightLimit = this._root.height*10

        while (x <= this._maxX) {
            let pt = this._evaluate(x);

            prevToken = ''+nextToken;

            d += `${(prevToken==='L'||nextToken==='L')?nextToken:prevToken}${pt.x.toFixed(this._precision)},${(Math.abs(pt.y)>HeightLimit)?0:pt.y.toFixed(this._precision)} `
            if ((pt.y > -100 && pt.y < this._root.height + 100)) {
                nextToken = 'L';
            } else {
                nextToken = 'M';
            }

            // scale the point to fit.
            points.push([pt.x, pt.y]);

            // Increase steps.
            // Auto scaling steps.
            x += this._steps;
        }

        // Plot
        if (this._shape.array().length === points.length && speed !== 0) {
            this._shape
                .animate(speed === undefined ? 2000 : speed)
                .plot(d);
        } else {
            this._shape.clear();
            this._shape.plot(d);
        }
        return this;
    }

    follow(showTangent?: Boolean) {
        if (showTangent !== undefined) {
            this._tangentShow = showTangent;
        }

        if (this._followPoint === undefined) {
            this._followPoint = this._root.svg.circle(10)
                .stroke({color: 'black', width: 0.5})
                .fill('white');
            let pt = this._evaluate(0);
            this._followPoint.center(pt.x, pt.y);

            // Create the tangent line
            this._tangent = this._root.svg.line()
                .stroke({color: 'black', width: 0.5});
            if (!this._tangentShow) {
                this._tangent.hide();
            }
        }

        this._root.svg.on('mousemove', (handler: any) => {
            // Real coordinate in pixels.
            let pt = this._root.svg.node.createSVGPoint();
            pt.x = handler.clientX;
            pt.y = handler.clientY;
            pt = pt.matrixTransform(this._root.svg.node.getScreenCTM().inverse());


            let x: number = pt.x / this._root.width * this._root.dx - this._root.origin.x,
                pathPt = this._evaluate(x);
            this._followPoint.center(pathPt.x, pathPt.y);

            if (x >= this._minX && x <= this._maxX) {
                this._followPoint.show();
                if (this._tangentShow) {
                    this._tangent.show();
                    this._tangentPlot(x);
                }
            } else {
                this._tangent.hide();
                this._followPoint.hide();
            }
        })
    }

    private _tangentPlot(x: number) {
        let pt1 = this._evaluate(x),
            pt2 = this._evaluate(x + this._tangentDX),
            slope = (pt2.y - pt1.y) / (pt2.x - pt1.x),
            h = pt1.y - slope * pt1.x;

        if (pt1.y * pt2.y < 0) {
            // Vertical asymptot
            this._tangent.plot(
                pt1.x, 0, pt1.x, this._root.height
            )
        } else {
            this._tangent.plot(
                0, h, this._root.width, slope * this._root.width + h
            )
        }


    }

    get path(): string {
        return this.shape.attr('d');
    }
    get shape(): Path {
        return this._shape;
    }
}