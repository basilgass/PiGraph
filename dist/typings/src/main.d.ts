import Graph from "./graphe";
export interface IAxis {
    x: {
        min: number;
        max: number;
    };
    y: {
        min: number;
        max: number;
    };
}
export interface IPoint {
    x: number;
    y: number;
}
export declare var PiGraph: {
    graph: typeof Graph;
};
