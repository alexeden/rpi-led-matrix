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

	static Napi::Value defaultMatrixOptions(const Napi::CallbackInfo& info);
	static Napi::Value defaultRuntimeOptions(const Napi::CallbackInfo& info);

private:
	static Napi::FunctionReference constructor;
	static RGBMatrix::Options createMatrixOptions(const Napi::Env& env, const Napi::Object& obj);
	static RuntimeOptions createRuntimeOptions(const Napi::Env& env, const Napi::Object& obj);

	RGBMatrix *matrix;
};

#endif
