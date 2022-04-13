#include <assert.h>
#include <cmath>
#include <napi.h>

#ifndef POINT_H
	#define POINT_H

struct Point {
	// Convert a [number, number] into a Point
	static Point from_tuple_value(const Napi::Value& value) {
		assert(value.IsArray());
		const auto arr = value.As<Napi::Array>();
		assert(arr.Length() == 2);
		int32_t x = arr.Get(uint32_t(0)).As<Napi::Number>().Int32Value();
		int32_t y = arr.Get(uint32_t(1)).As<Napi::Number>().Int32Value();

		return Point(x, y);
	}

	Point()
	  : x(0)
	  , y(0) {
	}

	Point(int32_t x_, int32_t y_)
	  : x(x_)
	  , y(y_) {
	}

	int32_t x;
	int32_t y;

	void maximize(const Point& p) {
		this->x = p.x > x ? p.x : x;
		this->y = p.y > y ? p.y : y;
	}

	void minimize(const Point& p) {
		this->x = p.x < x ? p.x : x;
		this->y = p.y < y ? p.y : y;
	}

	friend Point operator+(const Point& lhs, const Point& rhs) {
		return Point(lhs.x + rhs.x, lhs.y + rhs.y);
	}
	friend Point operator-(const Point& lhs, const Point& rhs) {
		return Point(lhs.x - rhs.x, lhs.y - rhs.y);
	}
	friend Point operator+(const Point& lhs, const int32_t rhs) {
		return Point(lhs.x + rhs, lhs.y + rhs);
	}
	friend Point operator-(const Point& lhs, const int32_t rhs) {
		return Point(lhs.x - rhs, lhs.y - rhs);
	}
	friend bool operator<(const Point& lhs, const Point& rhs) {
		return lhs.x < rhs.x || lhs.y < rhs.y;
	}
	friend bool operator>(const Point& lhs, const Point& rhs) {
		return rhs < lhs;
	}
	friend bool operator<=(const Point& lhs, const Point& rhs) {
		return !(lhs > rhs);
	}
	friend bool operator>=(const Point& lhs, const Point& rhs) {
		return !(lhs < rhs);
	}

	Point& operator++() {
		this->x++;
		this->y++;
		return *this;
	}

	Point& operator--() {
		this->x--;
		this->y--;
		return *this;
	}
};

#endif
