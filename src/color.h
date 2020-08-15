#ifndef COLOR_H
#define COLOR_H

#include <graphics.h>
#include <napi.h>

using namespace rgb_matrix;

/**
 * Create a Color instance from CallbackInfo.
 */
inline Color color_from_callback_info(const Napi::CallbackInfo& info) {
	if (info.Length() == 3) {
		uint8_t r = info[0].As<Napi::Number>().Uint32Value();
		uint8_t g = info[1].As<Napi::Number>().Uint32Value();
		uint8_t b = info[2].As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsObject()) {
		const auto obj = info[0].As<Napi::Object>();
		uint8_t r	   = obj.Get("r").As<Napi::Number>().Uint32Value();
		uint8_t g	   = obj.Get("g").As<Napi::Number>().Uint32Value();
		uint8_t b	   = obj.Get("b").As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsNumber()) {
		const auto hex = info[0].As<Napi::Number>().Uint32Value();
		return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
	}
	else {
		throw Napi::Error::New(info.Env(), "Failed to create color from parameters.");
	}
}

/**
 * Create an Object from a Color.
 */
inline Napi::Object color_to_js_object(const Napi::Env& env, const Color& color) {
	Napi::Object obj = Napi::Object::New(env);
	obj.Set("r", color.r);
	obj.Set("g", color.g);
	obj.Set("b", color.b);
	return obj;
}

#endif
