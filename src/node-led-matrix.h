
#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H
#define FOREBLU  "\x1B[34m"
#define FOREMAG  "\x1B[35m"
#define RESETTEXT  "\x1B[0m"

#include <napi.h>
#include <iostream>
#include <led-matrix.h>
#include <graphics.h>
#include "helpers.cc"
#include "napi-utils.cc"
#include "font.addon.h"

using namespace rgb_matrix;

class NodeLedMatrix : public Napi::ObjectWrap<NodeLedMatrix> {
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeLedMatrix(const Napi::CallbackInfo &info);
	~NodeLedMatrix();

	Napi::Value bg_color(const Napi::CallbackInfo& info);
	Napi::Value brightness(const Napi::CallbackInfo& info);
	Napi::Value clear(const Napi::CallbackInfo& info);
	Napi::Value draw_circle(const Napi::CallbackInfo& info);
	Napi::Value draw_line(const Napi::CallbackInfo& info);
	Napi::Value draw_rect(const Napi::CallbackInfo& info);
	Napi::Value draw_text(const Napi::CallbackInfo& info);
	Napi::Value fg_color(const Napi::CallbackInfo& info);
	Napi::Value fill(const Napi::CallbackInfo& info);
	Napi::Value font(const Napi::CallbackInfo& info);
	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value luminance_correct(const Napi::CallbackInfo& info);
	Napi::Value pwm_bits(const Napi::CallbackInfo& info);
	Napi::Value set_pixel(const Napi::CallbackInfo& info);
	Napi::Value width(const Napi::CallbackInfo& info);

	Napi::Value sync(const Napi::CallbackInfo& info);

	static Napi::Value default_matrix_options(const Napi::CallbackInfo& info);
	static Napi::Value default_runtime_options(const Napi::CallbackInfo& info);

private:
	static Color color_from_callback_info(const Napi::CallbackInfo& info);
	static Napi::Object obj_from_color(const Napi::Env& env, const Color&);
	static Napi::FunctionReference constructor;
	static Napi::Object matrix_options_to_obj(const Napi::Env& env, const RGBMatrix::Options& options);
	static Napi::Object runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options);
	static RGBMatrix::Options create_matrix_options(const Napi::Env& env, const Napi::Object& obj);
	static RuntimeOptions create_runtime_options(const Napi::Env& env, const Napi::Object& obj);

	Color fg_color_;
	Color bg_color_;
	Font *font_;
	RGBMatrix *matrix_;
	FrameCanvas *canvas_;
};

#endif
