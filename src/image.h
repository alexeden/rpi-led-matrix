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
		w	  = -1;
		h	  = -1;
	}

	Pixel* getPixels() {
		return pixels;
	}

	void setPixels(int w, int h, Pixel *ps) {
		w = w;
		h = h;
		pixels = ps;
	}

	const Pixel& getPixel(int x, int y) {
		static Pixel black;
		if (x < 0 || x >= w || y < 0 || y >= h) return black;
		return pixels[x + w * y];
	}

	bool isValid() {
		return pixels && h > 0 && w > 0;
	}

  private:
	int w;
	int h;
	Pixel* pixels;
};

/*
	struct Image {
		Image()
		  : width(-1)
		  , height(-1)
		  , image(NULL) {
		}
		~Image() {
			Delete();
		}
		void Delete() {
			delete[] image;
			Reset();
		}
		void Reset() {
			image  = NULL;
			width  = -1;
			height = -1;
		}
		inline bool IsValid() {
			return image && height > 0 && width > 0;
		}
		const Pixel &getPixel(int x, int y) {
			static Pixel black;
			if (x < 0 || x >= width || y < 0 || y >= height) return black;
			return image[x + width * y];
		}

		int width;
		int height;
		Pixel *image;
	};
*/
#endif
