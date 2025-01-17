import { BufferGeometry, Material, Shape, ShapeBufferGeometry, Vector3 } from "three";
import Cell from "./Cell";
import Tile, { } from "../map/Tile";
import { TileJSONData, TileType } from "../utils/Interfaces";
import Engine, { EngineTileShapes } from "../Engine";
import Grid from "./Grid";
import SqrTile from "../map/SqrTile";

export default class SqrCell extends Cell {
    public get neighborDirToGridDir(): { [key: string]: Vector3; } {
        return SqrCell._neighborDirToGridDir;
    }

    public get directions(): SqrCell[] {
        return SqrCell._directions as SqrCell[];
    }

    public get diagonals(): SqrCell[] {
        return SqrCell._diagonals as SqrCell[];
    }

    public get shape() {
        return EngineTileShapes.SQUARE;
    }

    constructor(radius: number, q?: number, r?: number, s?: number, h?: number, public grid?: Grid) {
        super(radius, q, r, s, h, grid)
    }

    protected _setCellWidthLengthAndFullSize() {
        this._cellWidth = this.radius;
        this._cellLength = this.radius;
        this._cellPerimeter = this.radius * 2;
    }

    protected _setCellDirections() {
        // pre-computed permutations
        SqrCell._directions = [new SqrCell(this.radius, +1, 0, 0), new SqrCell(this.radius, 0, -1, 0),
        new SqrCell(this.radius, -1, 0, 0), new SqrCell(this.radius, 0, +1, 0)];
        SqrCell._diagonals = [new SqrCell(this.radius, -1, -1, 0), new SqrCell(this.radius, -1, +1, 0),
        new SqrCell(this.radius, +1, +1, 0), new SqrCell(this.radius, +1, -1, 0)];
    }

    protected _createTile(data?: TileType | TileJSONData, isPlayable = true): Tile {
        const tile = new SqrTile(isPlayable ? this : null, data);
        return tile;
    }
}