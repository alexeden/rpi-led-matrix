
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

using namespace rgb_matrix;

class NodeLedMatrix : public Napi::ObjectWrap<NodeLedMatrix> {
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeLedMatrix(const Napi::CallbackInfo &info);
	~NodeLedMatrix();

	Napi::Value brightness(const Napi::CallbackInfo& info);
	void clear(const Napi::CallbackInfo& info);
	void draw_circle(const Napi::CallbackInfo& info);
	void draw_line(const Napi::CallbackInfo& info);
	void fill(const Napi::CallbackInfo& info);
	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value luminance_correct(const Napi::CallbackInfo& info);
	Napi::Value pwm_bits(const Napi::CallbackInfo& info);
	void set_pixel(const Napi::CallbackInfo& info);
	Napi::Value width(const Napi::CallbackInfo& info);

	static Napi::Value default_matrix_options(const Napi::CallbackInfo& info);
	static Napi::Value default_runtime_options(const Napi::CallbackInfo& info);

private:
	static Color color_from_callback_info(const Napi::CallbackInfo& info, uint8_t argOffset);
	static Napi::FunctionReference constructor;
	static Napi::Object matrix_options_to_obj(const Napi::Env& env, const RGBMatrix::Options& options);
	static Napi::Object runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options);
	static RGBMatrix::Options create_matrix_options(const Napi::Env& env, const Napi::Object& obj);
	static RuntimeOptions create_runtime_options(const Napi::Env& env, const Napi::Object& obj);

	RGBMatrix *matrix_;
};

#endif
