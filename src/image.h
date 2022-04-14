#ifndef MATRIXIMAGE_H
#define MATRIXIMAGE_H

#include <cstdlib>
#include <graphics.h>

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
		w_		= 0;
		h_		= 0;
	}

	Color* getPixels() {
		return pixels_;
	}

	void setPixels(uint32_t w, uint32_t h, Color* ps) {
		w_		= w;
		h_		= h;
		pixels_ = ps;
	}

	const Color& getPixel(uint32_t x, uint32_t y) {
		static Color black;
		if (x >= w_ || y >= h_) return black;
		return pixels_[x + w_ * y];
	}

	bool isValid() {
		return pixels_ && h_ > 0 && w_ > 0;
	}

  private:
	uint32_t w_;
	uint32_t h_;
	Color* pixels_;
};

#endif
