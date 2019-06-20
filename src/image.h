#ifndef MATRIXIMAGE_H
#define MATRIXIMAGE_H

#include "pixel.h"
#include <cstdlib>

class Image {
  public:
	Image()
	  : w_(0)
	  , h_(0)
	  , pixels_(NULL) {
	}
	~Image() {
		Delete();
	}
	void Delete() {
		delete[] pixels_;
		Reset();
	}
	void Reset() {
		pixels_ = NULL;
		w_	  	= 0;
		h_	  	= 0;
	}

	Pixel* getPixels() {
		return pixels_;
	}

	void setPixels(uint32_t w, uint32_t h, Pixel* ps) {
		w_	  = w;
		h_	  = h;
		pixels_ = ps;
	}

	const Pixel& getPixel(uint32_t x, uint32_t y) {
		static Pixel black;
		if (x >= w_ || y >= h_) return black;
		return pixels_[x + w_ * y];
	}

	bool isValid() {
		return pixels_ && h_ > 0 && w_ > 0;
	}

  private:
	uint32_t w_;
	uint32_t h_;
	Pixel* pixels_;
};

#endif
