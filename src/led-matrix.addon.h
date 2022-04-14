#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H

#include "edge.h"
#include "font.addon.h"
#include "image.h"
#include "napi-adapters.h"
#include "point.h"
#include <assert.h>
#include <cmath>
#include <graphics.h>
#include <led-matrix.h>
#include <math.h>
#include <napi.h>
#include <time.h>

using namespace rgb_matrix;

//
struct ShapeOptions {
	ShapeOptions()
	  : color(Color(0, 0, 0))
	  , fill(false) {
	}

	// NOTE - This function is immutable and creates a copy of `ShapeOptions`
	const ShapeOptions apply_napi_value(const Napi::Object& partial_opts) {
		auto opts = ShapeOptions();

		if (partial_opts.Has("color")) {
			opts.color = NapiAdapter<Color>::from_value(partial_opts.Get("color"));
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

	Napi::Value into_value(const Napi::Env& env) {
		auto obj	 = Napi::Object::New(env);
		obj["color"] = NapiAdapter<Color>::into_value(env, color);
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

	static Napi::Value available_pixel_mappers(const Napi::CallbackInfo& info) {
		return NapiAdapter<std::vector<std::string>>::into_value(info.Env(), GetAvailablePixelMappers());
	}

	static Napi::Value default_matrix_options(const Napi::CallbackInfo& info) {
		return NapiAdapter<RGBMatrix::Options>::into_value(info.Env(), RGBMatrix::Options());
	}

	static Napi::Value default_runtime_options(const Napi::CallbackInfo& info) {
		return NapiAdapter<RuntimeOptions>::into_value(info.Env(), RuntimeOptions());
	}

  private:
	static Napi::FunctionReference constructor;

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
