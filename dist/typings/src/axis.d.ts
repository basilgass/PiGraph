import Graph from "./graph";
export default class Axis {
    get gridDividers(): number;
    set gridDividers(value: number);
    private _root;
    private _markers;
    private _svg;
    private _orientation;
    private _o;
    private _gTicks;
    private _gGrid;
    private _gridShow;
    private _ticksShow;
    private _gridDividers;
    private _ticks;
    private _ticksLabels;
    private _tickOrigine;
    constructor(root: Graph);
    private _plot;
    horizontal(steps?: number, labels?: Function): this;
    vertical(steps?: number, labels?: Function): this;
    update(): Axis;
    updateTicks(): Axis;
    private _addTickLabel;
    xPixels(value: number): number;
    yPixels(value: number): number;
    showGrid(show?: boolean): Axis;
    showTicks(show?: boolean): Axis;
    updateGrid(): Axis;
    get ticks(): number;
    set ticks(value: number);
    get ticksLabels(): Function;
    set ticksLabels(value: Function);
    get tickOrigine(): Boolean | String;
    set tickOrigine(value: Boolean | String);
}
