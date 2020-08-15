#ifndef DEFAULTMATRIXOPTIONS_H
#define DEFAULTMATRIXOPTIONS_H

#include <led-matrix.h>
#include <napi.h>

/**
 * Create a JS object from the default matrix options.
 */
inline Napi::Value default_matrix_options(const Napi::CallbackInfo& info) {
	auto env		   = info.Env();
	const auto options = rgb_matrix::RGBMatrix::Options();
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

#endif
