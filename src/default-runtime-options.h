#ifndef DEFAULTRUNTIMEOPTIONS_H
#define DEFAULTRUNTIMEOPTIONS_H

#include <led-matrix.h>
#include <napi.h>

/**
 * Create a JS object from the default runtime options.
 */
inline Napi::Value default_runtime_options(const Napi::CallbackInfo& info) {
	auto env	 = info.Env();
	auto options = rgb_matrix::RuntimeOptions();

	auto obj = Napi::Object::New(env);

	obj.Set("gpioSlowdown", Napi::Number::New(env, options.gpio_slowdown));
	obj.Set("daemon", Napi::Number::New(env, options.daemon));
	obj.Set("dropPrivileges", Napi::Number::New(env, options.drop_privileges));
	obj.Set("doGpioInit", Napi::Boolean::New(env, options.do_gpio_init));

	return obj;
}

#endif
