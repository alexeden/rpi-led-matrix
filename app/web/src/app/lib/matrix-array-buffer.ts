export class MatrixArrayBuffer extends ArrayBuffer {
  static readonly pixelBytes = 3;
  static readonly rowIdBytes = 3;

  constructor(
    readonly rows: number,
    readonly cols: number
  ) {
    super(MatrixArrayBuffer.pixelBytes * rows * (cols + MatrixArrayBuffer.rowIdBytes));
    (window as any).matrixArrayBuffer = this;
  }
}
