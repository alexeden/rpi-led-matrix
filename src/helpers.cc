#ifndef HELPERS_NS
#define HELPERS_NS

#include <cstring>
#include <string>
#include <napi.h>
#include <sstream>

namespace helpers
{
	static char* string_to_c_str(const std::string& str) {
		char* cptr = new char[str.size()];
		strcpy(cptr, str.c_str());
		return cptr;
	}

	static Napi::Value getProp(const Napi::Env& env, const Napi::Object& obj, const char* key) {
		if (!obj.Has(key)) {
			std::stringstream ss;
			ss << "Object is missing the \"" << key << "\" property." << std::endl;
			throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
		}

		return obj.Get(key);
	}

	template<typename T>
	static Napi::Buffer<T> getBufferProp(Napi::Env& env, Napi::Object& obj, const char* key) {
		Napi::Value _value = getProp(env, obj, key);

		if (!_value.IsBuffer()) {
			std::stringstream ss;
			ss << "Object property \"" << key << "\" must be a buffer." << std::endl;
			throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
		}

		return _value.As<Napi::Buffer<T>>();
	}

	// static Napi::Number getNumberProp(Napi::Env& env, Napi::Object& obj, const char *key) {
	// 	Napi::Value _value = getProp(env, obj, key);

	// 	if (!_value.IsNumber()) {
	// 		std::stringstream ss;
	// 		ss << "Object property \"" << key << "\" must be a number." << std::endl;
	// 		throw Napi::Error::New(env, Napi::String::New(env, ss.str()));
	// 	}

	// 	return _value.As<Napi::Number>();
	// }

} // namespace node_led_matrix_helpers

#endif
