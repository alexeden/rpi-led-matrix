#ifndef MATRIXPIXEL_H
#define MATRIXPIXEL_H

#include <cstdlib>

typedef uint8_t byte;

class Pixel {
  public:
	Pixel()
	  : red(0)
	  , green(0)
	  , blue(0) {
	}

	byte r() const {
		return red;
	}
	void r(byte r) {
		red = r;
	}
	byte g() const {
		return green;
	}
	void g(byte g) {
		green = g;
	}
	byte b() const {
		return blue;
	}
	void b(byte b) {
		blue = b;
	}

  private:
	byte red;
	byte green;
	byte blue;
};

#endif
