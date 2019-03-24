#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H

#include <napi.h>
#include <iostream>
#include <led-matrix.h>
#include "napi-utils.cc"

using namespace rgb_matrix;

class NodeLedMatrix : public Napi::ObjectWrap<NodeLedMatrix> {
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeLedMatrix(const Napi::CallbackInfo &info);
	~NodeLedMatrix();

	Napi::Value brightness(const Napi::CallbackInfo& info);
	Napi::Value height(const Napi::CallbackInfo& info);
	Napi::Value width(const Napi::CallbackInfo& info);

	static Napi::Value defaultMatrixOptions(const Napi::CallbackInfo& info);
	static Napi::Value defaultRuntimeOptions(const Napi::CallbackInfo& info);

private:
	static Napi::FunctionReference constructor;
	static RGBMatrix::Options createMatrixOptions(const Napi::Env& env, const Napi::Object& obj);
	static RuntimeOptions createRuntimeOptions(const Napi::Env& env, const Napi::Object& obj);
	static Napi::Object matrixOptionsToObj(const Napi::Env& env, const RGBMatrix::Options& options);
	static Napi::Object runtimeOptionsToObj(const Napi::Env& env, const RuntimeOptions& options);

	RGBMatrix *matrix;
};

#endif
