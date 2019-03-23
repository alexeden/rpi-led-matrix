#ifndef NODELEDMATRIX_H
#define NODELEDMATRIX_H

#include <napi.h>
#include <iostream>
#include <led-matrix.h>

class NodeLedMatrix : public Napi::ObjectWrap<NodeLedMatrix> {
public:
	static Napi::Object Init(Napi::Env env, Napi::Object exports);
    NodeLedMatrix(const Napi::CallbackInfo &info);
private:
	static Napi::FunctionReference constructor;
};

#endif
