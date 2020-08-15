#ifndef MATRIXOPTIONS_H
#define MATRIXOPTIONS_H

#include <led-matrix.h>
#include <napi.h>

using namespace rgb_matrix;

/**
 * Create a JS object from the default matrix options.
 */
inline Napi::Value defaultMatrixOptions(const Napi::CallbackInfo& info) {
	auto env		   = info.Env();
	const auto options = RGBMatrix::Options();
	auto obj		   = Napi::Object::New(env);

	std::string hardware_mapping = options.hardware_mapping == NULL ? "" : std::string(options.hardware_mapping);

	std::string led_rgb_sequence = options.led_rgb_sequence == NULL ? "" : std::string(options.led_rgb_sequence);

	std::string pixel_mapper_config
	  = options.pixel_mapper_config == NULL ? "" : std::string(options.pixel_mapper_config);

	obj.Set("brightness", Napi::Number::New(env, options.brightness));
	obj.Set("chainLength", Napi::Number::New(env, options.chain_length));
	obj.Set("cols", Napi::Number::New(env, options.cols));
	obj.Set("disableHardwarePulsing", Napi::Boolean::New(env, options.disable_hardware_pulsing));
	obj.Set("hardwareMapping", Napi::String::New(env, hardware_mapping));
	obj.Set("inverseColors", Napi::Boolean::New(env, options.inverse_colors));
	obj.Set("ledRgbSequence", Napi::String::New(env, led_rgb_sequence));
	obj.Set("multiplexing", Napi::Number::New(env, options.multiplexing));
	obj.Set("parallel", Napi::Number::New(env, options.parallel));
	obj.Set("pixelMapperConfig", Napi::String::New(env, pixel_mapper_config));
	obj.Set("pwmBits", Napi::Number::New(env, options.pwm_bits));
	obj.Set("pwmDitherBits", Napi::Number::New(env, options.pwm_dither_bits));
	obj.Set("pwmLsbNanoseconds", Napi::Number::New(env, options.pwm_lsb_nanoseconds));
	obj.Set("rowAddressType", Napi::Number::New(env, options.row_address_type));
	obj.Set("rows", Napi::Number::New(env, options.rows));
	obj.Set("scanMode", Napi::Number::New(env, options.scan_mode));
	obj.Set("showRefreshRate", Napi::Boolean::New(env, options.show_refresh_rate));

	return obj;
}


/**
 * Create an instance of Options from a JS object.
 */
inline RGBMatrix::Options matrix_options_from_js_object(const Napi::Env& env, const Napi::Object& obj) {
	RGBMatrix::Options options = RGBMatrix::Options();

	options.brightness				 = obj.Get("brightness").As<Napi::Number>();
	options.chain_length			 = obj.Get("chainLength").As<Napi::Number>();
	options.cols					 = obj.Get("cols").As<Napi::Number>();
	options.disable_hardware_pulsing = obj.Get("disableHardwarePulsing").As<Napi::Boolean>();
	auto hardware_mapping			 = std::string(obj.Get("hardwareMapping").As<Napi::String>());
	options.hardware_mapping		 = strcpy(new char[hardware_mapping.size()], hardware_mapping.c_str());
	options.inverse_colors			 = obj.Get("inverseColors").As<Napi::Boolean>();
	auto led_rgb_sequence			 = std::string(obj.Get("ledRgbSequence").As<Napi::String>());
	options.led_rgb_sequence		 = strcpy(new char[led_rgb_sequence.size()], led_rgb_sequence.c_str());
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
	if (!options.Validate(&error)) throw Napi::Error::New(env, error);
	return options;
}

#endif
