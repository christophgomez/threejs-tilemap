import { Geometry, MeshPhongMaterial, Shape, BufferGeometry, ShapeGeometry } from 'three';
import Cell from '../grids/Cell';

export interface TileSettings {
  cell: Cell;
  geometry: Geometry;
  material?: MeshPhongMaterial;
  scale?: number;
};

export interface ExtrudeSettings {
  amount?: number;
  bevelEnabled?: boolean;
  bevelSegments?: number;
  steps?: number;
  bevelSize?: number;
  bevelThickness?: number;
};

export interface GenerateSettings {
  tileScale?: number;
  cellSize?: number;
  material?: MeshPhongMaterial;
  extrudeSettings?: ExtrudeSettings;
}

export interface GridSettings {
  cellSize?: number;
  size?: number;
};

export interface Grid {
  type: string;
  size: number;
  cellSize: number;
  cells: { [key: string]: Cell };
  numCells: number;
  extrudeSettings: ExtrudeSettings;
  autogenerated: boolean;
  cellShape: Shape;
  cellGeo: BufferGeometry;
  cellShapeGeo: ShapeGeometry;
};

export interface GridJSONData {
  size: number;
  cellSize: number;
  cells: Cell[];
  extrudeSettings: ExtrudeSettings;
  autogenerated: boolean;
}

