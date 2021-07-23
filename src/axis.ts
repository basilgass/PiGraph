import Graph, {createMarker} from "./graph";
import {G, Line, Marker} from "@svgdotjs/svg.js";

export default class Axis {
    get gridDividers(): number {
        return this._gridDividers;
    }

    set gridDividers(value: number) {
        this._gridDividers = value;
    }
    private _root: Graph;
    private _markers: { start: Marker, end: Marker };
    private _svg: Line;
    private _orientation: string
    private _o: { horizontal: string, vertical: string }
    private _gTicks: G;
    private _gGrid: G;
    private _gridShow: boolean;
    private _ticksShow: boolean;
    private _gridDividers: number;
    private _ticks: number;
    private _ticksLabels: Function;
    private _tickOrigine: Boolean | String;

    constructor(root: Graph) {
        this._root = root;
        this._markers = createMarker(this._root.svg, 20);

        this._svg = this._root.svg.line().stroke({color: 'black', width: this._root.strokeWidth(1)});
        this._svg.marker('end', this._markers.end)

        this._o = {
            horizontal: 'horizontal',
            vertical: 'vertical'
        }

        this._tickOrigine = '0';

        this._gridShow = false;
        this._ticksShow = true;
        this._gridDividers = 0;

        return this;
    }

    private _plot() {
        if (this._orientation === this._o.horizontal) {
            this._svg.plot(
                (this._root.origin.x + this._root.minX - 0.2) * this._root.ppcm,
                this._root.height - this._root.origin.y * this._root.ppcm,
                (this._root.origin.x + this._root.maxX + 0.2) * this._root.ppcm,
                this._root.height - this._root.origin.y * this._root.ppcm
            )
        } else if (this._orientation === this._o.vertical) {
            this._svg.plot(
                this._root.origin.x * this._root.ppcm,
                this._root.height - (this._root.origin.y + this._root.minY + 0.2) * this._root.ppcm,
                this._root.origin.x * this._root.ppcm,
                this._root.height - (this._root.origin.y + this._root.maxY - 0.2) * this._root.ppcm
            )
        }
    }

    horizontal(steps?: number, labels?: Function) {
        this._orientation = this._o.horizontal;
        this._ticks = steps === undefined ? 1 : steps;
        this._ticksLabels = labels;

        this._plot();
        return this;
    }

    vertical(steps?: number, labels?: Function) {
        this._orientation = this._o.vertical;
        this._ticks = steps === undefined ? 1 : steps;
        this._ticksLabels = labels;

        this._plot();
        return this;
    }

    update(): Axis {
        this._plot();
        if(this._gridShow){this.updateGrid();}
        this.updateTicks();
        return this;
    }

    updateTicks(): Axis {
        // Clear the group of updateTicks
        if (this._gTicks !== undefined) {
            this._gTicks.remove();
        }
        // Do not draw ticks
        if(!this._ticksShow){return;}

        // Create a new group.
        this._gTicks = this._root.svg.group();

        // Add the origine
        if (this._tickOrigine !== false) {
            this._addTickLabel(this.xPixels(0), this.yPixels(0), 0);
        }

        // Create the updateTicks until it overflows.
        let tickPlus = true, tickMinus = true,
            minI = 0,
            maxI = 1,
            posPlus,
            posMinus,
            x, y,
            tick;

        if (this._orientation === this._o.horizontal) {
            minI = this._root.minX;
            maxI = this._root.maxX;
        } else if (this._orientation === this._o.vertical) {
            minI = this._root.minY;
            maxI = this._root.maxY;
        }

        minI = Math.round(minI-1);
        maxI = Math.round(maxI-1);

        for(let i = minI; i<=maxI; i++){
            if(i===0){continue;}

            if (this._orientation === this._o.horizontal) {
                x = this.xPixels(this._ticks * i);
                y = this.yPixels(0);
                if(x<this._root.ppcm/2 || x>this._root.width-this._root.ppcm/2){continue;}

                // Create the tick
                tick = this._root.svg.line(x, y + 20, x, y - 20);

            } else if (this._orientation == this._o.vertical) {
                x = this.xPixels(0);
                y = this.yPixels(this._ticks * i);
                if(y<this._root.ppcm/2 || y>this._root.height-this._root.ppcm/2){continue;}

                // Create the tick
                tick = this._root.svg.line(x + 20, y, x - 20, y);
            }

            tick.stroke({color: 'black', width: this._root.strokeWidth(1)});
            this._gTicks.add(tick);

            if (this._ticksLabels !== undefined) {
                this._addTickLabel(x, y, i);
            }
        }

        return this;
    }

    private _addTickLabel(x: number, y: number, i: number, w?:number, h?:number): any {
        let dx, dy, textPos, text;
        let width = w===undefined ? 200: +w,
            height = h===undefined ? 200: +h;

        if (this._orientation === this._o.horizontal) {
            dx = x - width/2;
            dy = y + 20;
            textPos = 'center';
        } else if (this._orientation === this._o.vertical) {
            dx = x - width - 20;
            dy = +y;
            textPos = 'right';
        }

        if (i === 0) {
            text = typeof this._tickOrigine === 'string' ? this._tickOrigine : ((this._ticksLabels !== undefined) ? this._ticksLabels(0) : '0')
        } else {
            text = this._ticksLabels(i);
        }

        // @ts-ignore
        let fObj = this._root.svg.foreignObject(width, height).move(dx, dy);
        fObj.add(`<div style="text-align: ${textPos}">${text}</div>`);
        this._gTicks.add(fObj);
        return fObj;
    }

    xPixels(value: number): number {
        return (this._root.origin.x + value) * this._root.ppcm;
    }

    yPixels(value: number): number {
        return this._root.height - (this._root.origin.y + value) * this._root.ppcm;
    }

    showGrid(show?: boolean): Axis{
        // Determine if we need to show or hide the grid.
        if(show===undefined || show) {
            this.updateGrid();
            this._gGrid.show()
        }else{
            this._gGrid.hide();
        }

        return this
    }

    showTicks(show?:boolean):Axis{
        this._ticksShow = (show === undefined || show);
        this.updateTicks()
        return this;
    }

    updateGrid(): Axis{
        if (this._gGrid !== undefined) {
            this._gGrid.remove();
        }
        // Create a new group.
        this._gGrid = this._root.svg.group();

        // Create the updateTicks until it overflows.
        let minI = 0,
            maxI = 1,
            x, y,
            grid;

        if (this._orientation === this._o.horizontal) {
            minI = this._root.minX;
            maxI = this._root.maxX;
        } else if (this._orientation === this._o.vertical) {
            minI = this._root.minY;
            maxI = this._root.maxY;
        }

        for(let i = minI; i<=maxI; i = i + 1/(1+this._gridDividers)){
            if(i===0){continue;}
            if (this._orientation === this._o.horizontal) {
                x = this.xPixels(this._ticks * i);
                y = this.yPixels(0);

                grid = this._root.svg.line(x, 0, x, this._root.height);

            } else if (this._orientation == this._o.vertical) {
                x = this.xPixels(0);
                y = this.yPixels(this._ticks * i);

                grid = this._root.svg.line(0, y, this._root.width, y);
            }

            grid.stroke({color: 'grey', width: this._root.strokeWidth(0.2)});
            this._gGrid.add(grid);
        }

        return this;
    }
    get ticks(): number {
        return this._ticks;
    }

    set ticks(value: number) {
        this._ticks = value;
        this.updateTicks();
    }

    get ticksLabels(): Function {
        return this._ticksLabels;
    }

    set ticksLabels(value: Function) {
        this._ticksLabels = value;
        this.updateTicks();
    }


    get tickOrigine(): Boolean | String {
        return this._tickOrigine;
    }

    set tickOrigine(value: Boolean | String) {
        this._tickOrigine = value;
        this.updateTicks();
    }
}