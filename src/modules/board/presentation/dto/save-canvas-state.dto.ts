export class SaveCanvasStateDto {
  strokes!: Array<Record<string, unknown>>;
  surfaceStyle?: string;
  boardBgColor?: string;
  notebookWidthMode?: string;
  notebookPages?: number;
}
