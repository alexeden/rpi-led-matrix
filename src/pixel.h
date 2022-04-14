#ifndef PIXEL_H
#define PIXEL_H

#include "point.h"
#include <graphics.h>

struct Pixel {
	Pixel(Point origin, int x, int y, rgb_matrix::Color color)
	  : origin(origin)
	  , x(x)
	  , y(y)
	  , color(color) {
	}

	Point origin;
	int x;
	int y;
	rgb_matrix::Color color;
};

#endif
