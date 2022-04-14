/**
 * Defines a template class, `NapiAdapter`, that declares two static methods:
 * 1. `from_value` - Given an `Napi::Value`, returns `T`
 * 2. `into_value` - Given `T`, return `Napi::Value`
 *
 * Implements specializations of `NapiAdapter` for types used by
 * the native matrix library and types created for the typescript bindings.
 *
 * NOTE: If you ever see an error like this:
 * ```
 * node: symbol lookup error: ~/build/Release/rpi-led-matrix.node: undefined symbol:
 * _ZN11NapiAdapterIN10rgb_matrix14RuntimeOptionsEE15from_napi_valueERKN4Napi5ValueE
 * ```
 * It's because you're trying to use an adapter method on a type that does not
 * yet have a specialization/implementation.
 */
#ifndef NAPI_ADAPTERS_H
#define NAPI_ADAPTERS_H

#include "pixel.h"
#include "point.h"
#include <led-matrix.h>
#include <napi.h>

template<class T>
class NapiAdapter {
  public:
	static T from_value(const Napi::Value& value);
	static Napi::Value into_value(const Napi::Env& env, const T& arg);
};

/**
 *
 * Color
 *
 */
template<>
inline Color NapiAdapter<Color>::from_value(const Napi::Value& value) {
	assert(value.IsNumber());
	const auto hex = value.As<Napi::Number>().Uint32Value();
	return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
}

template<>
inline Napi::Value NapiAdapter<Color>::into_value(const Napi::Env& env, const Color& arg) {
	return Napi::Number::From(env, (arg.r << 16) | (arg.g << 8) | arg.b);
}

/**
 *
 * RGBMatrix::Options
 *
 */
template<>
inline RGBMatrix::Options NapiAdapter<RGBMatrix::Options>::from_value(const Napi::Value& value) {
	assert(value.IsObject());
	auto obj						 = value.As<Napi::Object>();
	RGBMatrix::Options options		 = RGBMatrix::Options();
	options.brightness				 = obj.Get("brightness").As<Napi::Number>();
	options.chain_length			 = obj.Get("chainLength").As<Napi::Number>();
	options.cols					 = obj.Get("cols").As<Napi::Number>();
	options.disable_hardware_pulsing = obj.Get("disableHardwarePulsing").As<Napi::Boolean>();
	auto hardware_mapping			 = std::string(obj.Get("hardwareMapping").As<Napi::String>());
	options.hardware_mapping		 = strcpy(new char[hardware_mapping.size()], hardware_mapping.c_str());
	options.inverse_colors			 = obj.Get("inverseColors").As<Napi::Boolean>();
	auto led_rgb_sequence			 = std::string(obj.Get("ledRgbSequence").As<Napi::String>());
	options.led_rgb_sequence		 = strcpy(new char[led_rgb_sequence.size()], led_rgb_sequence.c_str());
	options.limit_refresh_rate_hz	 = obj.Get("limitRefreshRateHz").As<Napi::Number>();
	auto panel_type					 = std::string(obj.Get("panelType").As<Napi::String>());
	options.panel_type				 = strcpy(new char[panel_type.size()], panel_type.c_str());
	auto pixel_mapper_config		 = std::string(obj.Get("pixelMapperConfig").As<Napi::String>());
	options.pixel_mapper_config		 = strcpy(new char[pixel_mapper_config.size()], pixel_mapper_config.c_str());
	options.multiplexing			 = obj.Get("multiplexing").As<Napi::Number>();
	options.parallel				 = obj.Get("parallel").As<Napi::Number>();
	options.pwm_bits				 = obj.Get("pwmBits").As<Napi::Number>();
	options.pwm_dither_bits			 = obj.Get("pwmDitherBits").As<Napi::Number>();
	options.pwm_lsb_nanoseconds		 = obj.Get("pwmLsbNanoseconds").As<Napi::Number>();
	options.row_address_type		 = obj.Get("rowAddressType").As<Napi::Number>();
	options.rows					 = obj.Get("rows").As<Napi::Number>();
	options.scan_mode				 = obj.Get("scanMode").As<Napi::Number>();
	options.show_refresh_rate		 = obj.Get("showRefreshRate").As<Napi::Boolean>();

	// Validate the options using native method
	std::string error;
	if (!options.Validate(&error)) throw Napi::Error::New(value.Env(), error);
	return options;
}

template<>
inline Napi::Value
NapiAdapter<RGBMatrix::Options>::into_value(const Napi::Env& env, const RGBMatrix::Options& options) {
	auto obj					  = Napi::Object::New(env);
	obj["brightness"]			  = Napi::Number::New(env, options.brightness);
	obj["chainLength"]			  = Napi::Number::New(env, options.chain_length);
	obj["cols"]					  = Napi::Number::New(env, options.cols);
	obj["disableHardwarePulsing"] = Napi::Boolean::New(env, options.disable_hardware_pulsing);
	obj["hardwareMapping"]		  = options.hardware_mapping == NULL ? "" : std::string(options.hardware_mapping);
	obj["inverseColors"]		  = Napi::Boolean::New(env, options.inverse_colors);
	obj["ledRgbSequence"]		  = options.led_rgb_sequence == NULL ? "" : std::string(options.led_rgb_sequence);
	obj["limitRefreshRateHz"]	  = Napi::Number::New(env, options.limit_refresh_rate_hz);
	obj["multiplexing"]			  = Napi::Number::New(env, options.multiplexing);
	obj["panelType"]			  = options.panel_type == NULL ? "" : std::string(options.panel_type);
	obj["parallel"]				  = Napi::Number::New(env, options.parallel);
	obj["pixelMapperConfig"]	  = options.pixel_mapper_config == NULL ? "" : std::string(options.pixel_mapper_config);
	obj["pwmBits"]				  = Napi::Number::New(env, options.pwm_bits);
	obj["pwmDitherBits"]		  = Napi::Number::New(env, options.pwm_dither_bits);
	obj["pwmLsbNanoseconds"]	  = Napi::Number::New(env, options.pwm_lsb_nanoseconds);
	obj["rowAddressType"]		  = Napi::Number::New(env, options.row_address_type);
	obj["rows"]					  = Napi::Number::New(env, options.rows);
	obj["scanMode"]				  = Napi::Number::New(env, options.scan_mode);
	obj["showRefreshRate"]		  = Napi::Boolean::New(env, options.show_refresh_rate);

	return obj;
}

/**
 *
 * Point
 *
 */
template<>
inline Point NapiAdapter<Point>::from_value(const Napi::Value& value) {
	assert(value.IsArray());
	const auto arr = value.As<Napi::Array>();
	assert(arr.Length() == 2);
	int32_t x = arr.Get(uint32_t(0)).As<Napi::Number>().Int32Value();
	int32_t y = arr.Get(uint32_t(1)).As<Napi::Number>().Int32Value();

	return Point(x, y);
}

template<>
inline Napi::Value NapiAdapter<Point>::into_value(const Napi::Env& env, const Point& arg) {
	auto value = Napi::Array::New(env, 2);
	value.Set(uint32_t(0), Napi::Number::New(env, arg.x));
	value.Set(uint32_t(1), Napi::Number::New(env, arg.y));
	return value;
}

/**
 *
 * Pixel
 *
 */
template<>
inline Pixel NapiAdapter<Pixel>::from_value(const Napi::Value& value) {
	assert(value.IsObject());
	const auto obj = value.As<Napi::Object>();

	return Pixel(
	  NapiAdapter<Point>::from_value(obj.Get("origin")),
	  obj.Get("x").As<Napi::Number>().Int32Value(),
	  obj.Get("y").As<Napi::Number>().Int32Value(),
	  NapiAdapter<Color>::from_value(obj.Get("color")));
}

template<>
inline Napi::Value NapiAdapter<Pixel>::into_value(const Napi::Env& env, const Pixel& pixel) {
	auto obj	  = Napi::Object::New(env);
	obj["origin"] = NapiAdapter<Point>::into_value(env, pixel.origin);
	obj["x"]	  = Napi::Number::From(env, pixel.x);
	obj["y"]	  = Napi::Number::From(env, pixel.y);
	obj["color"]  = NapiAdapter<Color>::into_value(env, pixel.color);

	return obj;
}

/**
 *
 * rgb_matrix::RuntimeOptions
 *
 */
template<>
inline rgb_matrix::RuntimeOptions NapiAdapter<rgb_matrix::RuntimeOptions>::from_value(const Napi::Value& value) {
	assert(value.IsObject());
	auto obj						   = value.As<Napi::Object>();
	rgb_matrix::RuntimeOptions options = rgb_matrix::RuntimeOptions();
	options.gpio_slowdown			   = obj.Get("gpioSlowdown").As<Napi::Number>();
	options.daemon					   = obj.Get("daemon").As<Napi::Number>();
	options.drop_privileges			   = obj.Get("dropPrivileges").As<Napi::Number>();
	options.do_gpio_init			   = obj.Get("doGpioInit").As<Napi::Boolean>();

	return options;
}

template<>
inline Napi::Value
NapiAdapter<rgb_matrix::RuntimeOptions>::into_value(const Napi::Env& env, const rgb_matrix::RuntimeOptions& arg) {
	auto obj			  = Napi::Object::New(env);
	obj["daemon"]		  = Napi::Number::From(env, arg.daemon);
	obj["doGpioInit"]	  = Napi::Boolean::From(env, arg.do_gpio_init);
	obj["dropPrivileges"] = Napi::Number::From(env, arg.drop_privileges);
	obj["gpioSlowdown"]	  = Napi::Number::From(env, arg.gpio_slowdown);

	return obj;
}

/**
 *
 * vector<string>
 *
 */
template<>
inline Napi::Value
NapiAdapter<std::vector<std::string>>::into_value(const Napi::Env& env, const std::vector<std::string>& arg) {
	Napi::Array array = Napi::Array::New(env, arg.size());
	for (uint8_t i = 0; i < arg.size(); i++) array.Set(i, Napi::String::New(env, arg.at(i)));

	return array;
}

#endif
