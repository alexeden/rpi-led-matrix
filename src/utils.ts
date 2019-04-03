import { PixelMapper, PixelMapperType } from './types';

export class LedMatrixUtils {
  static encodeMappers(...mappers: PixelMapper[]): string {
    return mappers
      .map(mapper => {
        switch (mapper.type) {
          case PixelMapperType.Rotate: return [PixelMapperType.Rotate, mapper.angle].join(':');
          case PixelMapperType.U: return PixelMapperType.U;
        }
      })
      .join(';');
  }
}
