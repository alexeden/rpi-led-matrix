#ifndef EDGE_H
#define EDGE_H

#include "point.h"
#include <cmath>
#include <napi.h>

struct Edge {
	Edge(Point& p0_, Point& p1_)
	  : p0(p0_)
	  , p1(p1_)
	  , x0(p0.x)
	  , y0(p0.y)
	  , x1(p1.x)
	  , y1(p1.y)
	  , m(((float) p1.y - (float) p0.y) / ((float) p1.x - (float) p0.x))
	  , b((float) p0.y - (m * (float) p0.x)) {
	}

	const Point p0;
	const Point p1;
	const int32_t x0;
	const int32_t y0;
	const int32_t x1;
	const int32_t y1;
	const float m;
	const float b;
};

#endif
