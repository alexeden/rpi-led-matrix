#ifndef MATRIXIMAGE_H
#define MATRIXIMAGE_H

#include "pixel.h"
#include <cstdlib>

class Image {
  public:
	Image()
	  : w(-1)
	  , h(-1)
	  , pixels(NULL) {
	}
	~Image() {
		Delete();
	}
	void Delete() {
		delete[] pixels;
		Reset();
	}
	void Reset() {
		pixels = NULL;
		w	  = 0;
		h	  = 0;
	}

	Pixel* getPixels() {
		return pixels;
	}

	void setPixels(uint32_t w, uint32_t h, Pixel* ps) {
		w	  = w;
		h	  = h;
		pixels = ps;
	}

	const Pixel& getPixel(int x, int y) {
		static Pixel black;
		if (x < 0 || x >= (signed) w || y < 0 || y >= (signed) h) return black;
		return pixels[x + w * y];
	}

	bool isValid() {
		return pixels && h > 0 && w > 0;
	}

  private:
	uint32_t w;
	uint32_t h;
	Pixel* pixels;
};

#endif
