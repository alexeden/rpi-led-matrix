#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H

#include "image.h"
#include "matrix-options.h"
#include "runtime-options.h"
#include <assert.h>
#include <graphics.h>
#include <iostream>
#include <led-matrix.h>
#include <napi.h>
#include <time.h>

using namespace rgb_matrix;

class LedMatrixAddon : public Napi::ObjectWrap<LedMatrixAddon> {
  public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
	LedMatrixAddon(const Napi::CallbackInfo& info);
	~LedMatrixAddon();

	Napi::Value after_sync(const Napi::CallbackInfo& info);
	Napi::Value bg_color(const Napi::CallbackInfo& info);
	Napi::Value brightness(const Napi::CallbackInfo& info);
	Napi::Value clear(const Napi::CallbackInfo& info);
	Napi::Value draw_buffer(const Napi::CallbackInfo& info);
	Napi::Value draw_circle(const Napi::CallbackInfo& info);
	Napi::Value draw_line(const Napi::CallbackInfo& info);
	Napi::Value draw_rect(const Napi::CallbackInfo& info);
	Napi::Value fg_color(const Napi::CallbackInfo& info);
	Napi::Value fill(const Napi::CallbackInfo& info);
	Napi::Value get_available_pixel_mappers(const Napi::CallbackInfo& info);
	Napi::Value map(const Napi::CallbackInfo& info);
	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value luminance_correct(const Napi::CallbackInfo& info);
	Napi::Value pwm_bits(const Napi::CallbackInfo& info);
	Napi::Value set_pixel(const Napi::CallbackInfo& info);
	Napi::Value width(const Napi::CallbackInfo& info);

	Napi::Value sync(const Napi::CallbackInfo& info);

  private:
	static Color color_from_callback_info(const Napi::CallbackInfo& info);
	static Napi::Object obj_from_color(const Napi::Env& env, const Color&);
	static Napi::FunctionReference constructor;

	Napi::FunctionReference after_sync_cb_;
	Color fg_color_;
	Color bg_color_;
	RGBMatrix* matrix_;
	FrameCanvas* canvas_;
	const uint64_t t_start_;
	uint64_t t_sync_ms_;
	uint64_t t_dsync_ms_;
};

#endif
