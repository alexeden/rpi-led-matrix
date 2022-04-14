#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H

#include "edge.h"
#include "font.addon.h"
#include "image.h"
#include "point.h"
#include "utils.h"
#include <assert.h>
#include <cmath>
#include <graphics.h>
#include <led-matrix.h>
#include <math.h>
#include <napi.h>
#include <time.h>

using namespace rgb_matrix;

template<class T>
class NapiAdapter {
  public:
	static T from_napi_value(const Napi::Value& value);
	static Napi::Value into_napi_value(const T& arg);
};

template<>
inline RuntimeOptions NapiAdapter<RuntimeOptions>::from_napi_value(const Napi::Value& value) {
	assert(value.IsObject());
	auto obj				= value.As<Napi::Object>();
	RuntimeOptions options	= RuntimeOptions();
	options.gpio_slowdown	= obj.Get("gpioSlowdown").As<Napi::Number>();
	options.daemon			= obj.Get("daemon").As<Napi::Number>();
	options.drop_privileges = obj.Get("dropPrivileges").As<Napi::Number>();
	options.do_gpio_init	= obj.Get("doGpioInit").As<Napi::Boolean>();

	return options;
}

template<>
inline RGBMatrix::Options NapiAdapter<RGBMatrix::Options>::from_napi_value(const Napi::Value& value) {
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

struct ShapeOptions {
	ShapeOptions()
	  : color(Color(0, 0, 0))
	  , fill(false) {
	}

	// NOTE - This function is immutable and creates a copy of `ShapeOptions`
	const ShapeOptions apply_napi_value(const Napi::Object& partial_opts) {
		auto opts = ShapeOptions();

		if (partial_opts.Has("color")) {
			auto color_value = partial_opts.Get("color");
			opts.color		 = color_from_napi_value_or_default(color_value, color);
		}
		else {
			opts.color = color;
		}

		if (partial_opts.Has("fill")) {
			auto fill_value = partial_opts.Get("fill");
			assert(fill_value.IsBoolean());
			opts.fill = fill_value.As<Napi::Boolean>();
		}
		else {
			opts.fill = fill;
		}

		return opts;
	}

	Napi::Value into_napi_value(const Napi::Env& env) {
		auto obj	 = Napi::Object::New(env);
		obj["color"] = color_into_napi_object(env, color);
		obj["fill"]	 = Napi::Boolean::From(env, fill);
		return obj;
	}

	Color color;
	bool fill;
};

class LedMatrixAddon : public Napi::ObjectWrap<LedMatrixAddon> {
  public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
	LedMatrixAddon(const Napi::CallbackInfo& info);
	~LedMatrixAddon();

	Napi::Value after_sync(const Napi::CallbackInfo& info);
	Napi::Value bg_color(const Napi::CallbackInfo& info);
	Napi::Value brightness(const Napi::CallbackInfo& info);
	Napi::Value center(const Napi::CallbackInfo& info);
	Napi::Value clear(const Napi::CallbackInfo& info);
	Napi::Value draw_buffer(const Napi::CallbackInfo& info);
	Napi::Value draw_circle(const Napi::CallbackInfo& info);
	Napi::Value draw_line(const Napi::CallbackInfo& info);
	Napi::Value draw_rect(const Napi::CallbackInfo& info);
	Napi::Value draw_text(const Napi::CallbackInfo& info);
	Napi::Value fg_color(const Napi::CallbackInfo& info);
	Napi::Value fill_color(const Napi::CallbackInfo& info);
	Napi::Value fill(const Napi::CallbackInfo& info);
	Napi::Value font(const Napi::CallbackInfo& info);
	Napi::Value get_available_pixel_mappers(const Napi::CallbackInfo& info);
	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value luminance_correct(const Napi::CallbackInfo& info);
	Napi::Value map(const Napi::CallbackInfo& info);
	Napi::Value pwm_bits(const Napi::CallbackInfo& info);
	Napi::Value set_pixel(const Napi::CallbackInfo& info);
	Napi::Value shape_options(const Napi::CallbackInfo& info);
	Napi::Value unstable_draw_circle(const Napi::CallbackInfo& info);
	Napi::Value unstable_draw_polygon(const Napi::CallbackInfo& info);
	Napi::Value unstable_draw_rectangle(const Napi::CallbackInfo& info);
	Napi::Value width(const Napi::CallbackInfo& info);

	Napi::Value sync(const Napi::CallbackInfo& info);

	static Napi::Value default_matrix_options(const Napi::CallbackInfo& info);
	static Napi::Value default_runtime_options(const Napi::CallbackInfo& info);

  private:
	// static Color color_from_value_or_default(const Napi::Value& value, const Color& default_color);
	// static Color color_from_callback_info(const Napi::CallbackInfo& info);
	static Napi::FunctionReference constructor;
	static Napi::Object matrix_options_to_obj(const Napi::Env& env, const RGBMatrix::Options& options);
	static Napi::Object runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options);
	// static RGBMatrix::Options create_matrix_options(const Napi::Env& env, const Napi::Object& obj);
	// static RuntimeOptions create_runtime_options(const Napi::Env& env, const Napi::Object& obj);

	Napi::FunctionReference after_sync_cb_;
	Color bg_color_;
	Color fg_color_;
	Font* font_;
	std::string font_name_;
	RGBMatrix* matrix_;
	FrameCanvas* canvas_;
	const long t_start_;
	long t_sync_ms_;
	long t_dsync_ms_;

	// Default shape drawing options
	ShapeOptions default_shape_options_;
};

#endif
