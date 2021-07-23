import {Circle, G, Line, Path} from "@svgdotjs/svg.js";
import {IPoint} from "./main";
import Graph from "./graph";
import {evaluate} from "mathjs";


export default class Plot {
    private _root: Graph;
    private _fx: string;
    private _asymptote: boolean;
    private _steps: number
    private _minX: number
    private _maxX: number
    private _followPoint: Circle;
    private _tangent: Line;
    private _tangentDX: number;
    private _tangentShow: Boolean;
    private _precision: number;
    private _shapeGroup: G;
    private _histFrequency: Path;


    constructor(root: Graph, fx: string, domain?: [number, number], steps?: number) {
        this._root = root;
        this._fx = this.parseFx(fx);

        this._steps = steps === undefined ? 0.025 : +steps;
        this._minX = domain === undefined ? this._root.minX : domain[0];
        this._maxX = domain === undefined ? this._root.maxX : domain[1];

        this._precision = 2;
        this._tangentShow = false;
        this._tangentDX = 0.000001;

        //this._shape = root.svg.polyline().stroke('black').fill('none');
        this._shape = root.svg.path().fill('none').stroke({color: 'black', width: this._root.strokeWidth(1)});
        this.plot();
        return this;
    }

    private _shape: Path;

    get shape(): Path {
        return this._shape;
    }

    get path(): string {
        return this.shape.attr('d');
    }

    plotFunction(speed?: number): Plot {
        let points = [],
            d = ``,
            nextToken = 'M',
            prevToken = '',
            x = +this._minX,
            HeightLimit = this._root.height * 10

        while (x <= this._maxX) {
            let pt = this._evaluate(x);

            prevToken = '' + nextToken;

            // Create the line.
            d += `${(prevToken === 'L' || nextToken === 'L') ? nextToken : prevToken}`;
            //d += `${pt.x.toFixed(this._precision)},${(Math.abs(pt.y)>HeightLimit)?0:pt.y.toFixed(this._precision)} `
            d += `${pt.x.toFixed(this._precision)},${(Math.abs(pt.y) > HeightLimit) ? 0 : pt.y.toFixed(this._precision)} `

            // Prepare the next point (break or continuous line)
            if ((pt.y > -100 && pt.y < this._root.height + 100)) {
                nextToken = 'L';
            } else {
                nextToken = 'M';
            }

            // scale the point to fit.
            points.push([pt.x, pt.y]);

            // Increase steps.
            // TODO: Auto scaling steps.
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

    plotAsymptote(speed?: number): Plot {
        // * this._root.ppcm
        if (this._fx.indexOf('x=') === -1) {
            return this;
        }

        let x = +this._fx.split('x=')[1];

        let d = `M${(this._root.origin.x + x) * this._root.ppcm} ${-this._root.height} L${(this._root.origin.x + x) * this._root.ppcm} ${this._root.height}`;

        this._shape.clear();
        this._shape.plot(d);

        return this;
    }

    hist(data: number[], labels: any[]): Plot {
        // The labels does not match the number of data.
        if (data.length !== labels.length) {
            return this;
        }

        // Remove the shapegroup if it already exists
        if(this._shapeGroup){this._shapeGroup.remove();}

        this._shapeGroup = this._root.svg.group();

        for (let i = 0; i < data.length; i++) {
            let pt = this._evaluateCoord(i + 1, 0),
                wh = {w: 1 * this._root.ppcm, h: data[i] * this._root.ppcm};

            this._shapeGroup.add(this._root.svg.rect(wh.w, wh.h).move(pt.x, pt.y - wh.h).fill('red').stroke({color: 'black', width: this._root.strokeWidth(1)}));
        }
        return this;
    }
    histFrequency(show?:boolean): Plot{
        if(show===undefined){show = true}

        if(show){
            let rects = this._shapeGroup.find('rect'),
                startPt = this._evaluateCoord(0.5, 0),
                endPt = this._evaluateCoord(rects.length+1.5, 0),
                polyline = [[startPt.x, startPt.y]];
            for(let i=0; i<rects.length; i++){
                polyline.push([rects[i].x()+rects[i].width()/2, rects[i].y()]);
            }

            polyline.push([endPt.x, endPt.y])
            // @ts-ignore
            this._histFrequency = this._root.svg.polyline(polyline).stroke({color: 'black', width: this._root.strokeWidth(2)}).fill('none');
        }else if(show===false){
            this._histFrequency.remove()
        }

        return this;
    }

    mustache(data: {
        x1:number, x2:number,x3:number,
        minX: number, maxX: number,
        height?:number, width?:number, horizontal?:boolean, factor?:number}):Plot {

        if(data.height===undefined){data.height = 2;}
        if(data.width===undefined){data.width = 1;}
        if(data.horizontal===undefined){data.horizontal = true;}
        if(data.factor===undefined){data.factor = 1.5;}

        // Remove the shapegroup if it already exists
        if(this._shapeGroup){this._shapeGroup.remove();}
        this._shapeGroup = this._root.svg.group();

        let h = data.height*this._root.ppcm,
            w = data.width*this._root.ppcm;

        let Q = data.x3-data.x1,
            b1 = this._evaluateCoord(Math.max(data.x1-data.factor*Q, data.minX===undefined?-10000:data.minX), data.height),
            b2 = this._evaluateCoord(Math.min(data.x3+data.factor*Q, data.maxX===undefined?10000:data.maxX), data.height),
            x14 = this._evaluateCoord(data.x1, data.height),
            x24 = this._evaluateCoord(data.x2, data.height),
            x34 = this._evaluateCoord(data.x3, data.height);

        // Mustach box
        this._shapeGroup.add(this._root.svg.polyline([
                [x14.x, x14.y-w/2],
                [x14.x, x14.y+w/2],
                [x34.x, x34.y+w/2],
                [x34.x, x34.y-w/2],
                [x14.x, x34.y-w/2]
            ]).fill('none').stroke({color: 'black', width: this._root.strokeWidth(2)})
        );
        this._shapeGroup.add(this._root.svg.line([
                [x24.x, x24.y-w/2],
                [x24.x, x24.y+w/2],
            ]).fill('none').stroke({color: 'red', width: this._root.strokeWidth(2)})
        );
        // Left mustache
        this._shapeGroup.add(this._root.svg.line([
                [b1.x, b1.y-w/2],
                [b1.x, b1.y+w/2],
            ]).fill('none').stroke({color: 'black', width: this._root.strokeWidth(2)})
        );
        this._shapeGroup.add(this._root.svg.line([
                [b1.x, x14.y],
                [x14.x, x14.y],
            ]).fill('none').stroke({color: 'black', width: this._root.strokeWidth(2)})
        );
        // Right mustache
        this._shapeGroup.add(this._root.svg.line([
                [b2.x, b2.y-w/2],
                [b2.x, b2.y+w/2],
            ]).fill('none').stroke({color: 'black', width: this._root.strokeWidth(2)})
        );
        this._shapeGroup.add(this._root.svg.line([
                [b2.x, x34.y],
                [x34.x, x34.y],
            ]).fill('none').stroke({color: 'black', width: this._root.strokeWidth(2)})
        );

        return this;
    }
    plot(speed?: number): Plot {
        if (this._fx === 'stat') {
            return;
        }

        if (this._asymptote) {
            return this.plotAsymptote(speed);
        } else {
            return this.plotFunction(speed);
        }
    }

    updatePlot(fx: string, speed?: number): Plot {
        this._fx = this.parseFx(fx);
        this.plot(speed);

        return this;
    }

    samples(samples: number): Plot {
        this._steps = samples > 0 ? 1 / samples : 0.01;
        // this._precision = Math.round(Math.log(samples));
        return this;
    }

    follow(showTangent?: Boolean): Plot {
        if (showTangent !== undefined) {
            this._tangentShow = showTangent;
        }

        if (this._tangentShow === false) {
            // Remove the follow point and tangent.
            this._root.svg.off('mousemove')
            if (this._followPoint) {
                this._followPoint.remove();
            }
            if (this._tangent) {
                this._tangent.remove();
            }
            return this;
        }

        // There is no "follow point element"
        if (this._followPoint === undefined) {
            this._followPoint = this._root.svg.circle(this._root.strokeWidth(10))
                .stroke({color: 'black', width: this._root.strokeWidth(0.5)})
                .fill('white');
            let pt = this._evaluate(0);
            this._followPoint.center(pt.x, pt.y);

            // Create the tangent line
            this._tangent = this._root.svg.line()
                .stroke({color: 'black', width: this._root.strokeWidth(0.5)});
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

        return this;
    }

    dash(value: number | string): Plot {
        if (typeof value === "number") {
            this._shape.stroke({'dasharray': `${value} ${value}`});
        } else {
            this._shape.stroke({'dasharray': value});
        }
        return this;
    }

    color(value: string): Plot {
        this._shape.stroke(value);
        return this;
    }

    width(value: number): Plot {
        this._shape.stroke({width: this._root.strokeWidth(value)});
        return this;
    }

    private _evaluate(x: number): IPoint {
        return {
            x: (this._root.origin.x + x) * this._root.ppcm,
            y: (this._root.dy - this._root.origin.y - evaluate(this._fx, {'x': x})) * this._root.ppcm
        }
    }

    private _evaluateCoord(x: number, y: number): IPoint {
        return {
            x: (this._root.origin.x + x) * this._root.ppcm,
            y: (this._root.dy - this._root.origin.y - y) * this._root.ppcm
        }
    }

    private parseFx(fx: string) {
        // Determine type of function
        if (fx === 'stat') {
            return fx;
        }

        // make sure fx is parsed correctly.
        if (fx.match(/[a-z]\(/g)) {
            fx = fx.replace(/([a-z])(\()/g, "$1*$2");
        }

        // Determine if we have a vertical asymptote
        this._asymptote = fx.indexOf('x=') === 0 ? true : false;

        return fx;
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

}