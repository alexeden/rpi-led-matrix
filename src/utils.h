#ifndef UTILS_H
#define UTILS_H

inline Color color_from_napi_value_or_default(const Napi::Value& value, const Color& default_color) {
	if (value.IsArray()) {
		auto arr = value.As<Napi::Array>();
		assert(arr.Length() == 3);
		uint8_t r = arr.Get(uint32_t(0)).As<Napi::Number>().Uint32Value();
		uint8_t g = arr.Get(uint32_t(1)).As<Napi::Number>().Uint32Value();
		uint8_t b = arr.Get(uint32_t(2)).As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (value.IsObject()) {
		const auto obj = value.As<Napi::Object>();
		uint8_t r	   = obj.Get("r").As<Napi::Number>().Uint32Value();
		uint8_t g	   = obj.Get("g").As<Napi::Number>().Uint32Value();
		uint8_t b	   = obj.Get("b").As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (value.IsNumber()) {
		const auto hex = value.As<Napi::Number>().Uint32Value();
		return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
	}
	else {
		return default_color;
	}
}

inline Napi::Object color_into_napi_object(const Napi::Env env, const Color& color) {
	auto obj = Napi::Object::New(env);
	obj["r"] = color.r;
	obj["g"] = color.g;
	obj["b"] = color.b;
	return obj;
}

#endif
