#include "led-matrix.addon.h"

#define BILLION 1000000000L;
#define MILLION 1000000000L;

inline double get_now_ms() {
	struct timespec t;
	if (clock_gettime(CLOCK_MONOTONIC_RAW, &t) < 0) {
		throw "Failed to get the current time.";
	}

	return (t.tv_sec * 1000) + (t.tv_nsec / 1000000);
}

using namespace rgb_matrix;

Napi::FunctionReference LedMatrixAddon::constructor;

Napi::Object LedMatrixAddon::Init(Napi::Env env, Napi::Object exports) {
	Napi::Function func = DefineClass(
	  env,
	  "LedMatrix",
	  { StaticMethod("defaultMatrixOptions", &LedMatrixAddon::default_matrix_options),
		StaticMethod("defaultRuntimeOptions", &LedMatrixAddon::default_runtime_options),
		InstanceMethod("afterSync", &LedMatrixAddon::after_sync),
		InstanceMethod("bgColor", &LedMatrixAddon::bg_color),
		InstanceMethod("brightness", &LedMatrixAddon::brightness),
		InstanceMethod("center", &LedMatrixAddon::center),
		InstanceMethod("clear", &LedMatrixAddon::clear),
		InstanceMethod("drawBuffer", &LedMatrixAddon::draw_buffer),
		InstanceMethod("drawCircle", &LedMatrixAddon::draw_circle),
		InstanceMethod("unstable_drawCircle", &LedMatrixAddon::unstable_draw_circle),
		InstanceMethod("unstable_drawPolygon", &LedMatrixAddon::unstable_draw_polygon),
		InstanceMethod("unstable_drawRectangle", &LedMatrixAddon::unstable_draw_rectangle),
		InstanceMethod("drawLine", &LedMatrixAddon::draw_line),
		InstanceMethod("drawRect", &LedMatrixAddon::draw_rect),
		InstanceMethod("drawText", &LedMatrixAddon::draw_text),
		InstanceMethod("fgColor", &LedMatrixAddon::fg_color),
		InstanceMethod("fill", &LedMatrixAddon::fill),
		InstanceMethod("font", &LedMatrixAddon::font),
		InstanceMethod("getAvailablePixelMappers", &LedMatrixAddon::get_available_pixel_mappers),
		InstanceMethod("height", &LedMatrixAddon::height),
		InstanceMethod("luminanceCorrect", &LedMatrixAddon::luminance_correct),
		InstanceMethod("map", &LedMatrixAddon::map),
		InstanceMethod("pwmBits", &LedMatrixAddon::pwm_bits),
		InstanceMethod("setPixel", &LedMatrixAddon::set_pixel),
		InstanceMethod("shapeOptions", &LedMatrixAddon::shape_options),
		InstanceMethod("sync", &LedMatrixAddon::sync),
		InstanceMethod("width", &LedMatrixAddon::width) });

	constructor = Napi::Persistent(func);
	constructor.SuppressDestruct();
	exports.Set("LedMatrix", func);

	return exports;
}

/**
 * Process matrix & runtime options and initialize the internal RGBMatrix.
 */
LedMatrixAddon::LedMatrixAddon(const Napi::CallbackInfo& info)
  : Napi::ObjectWrap<LedMatrixAddon>(info)
  , after_sync_cb_(Napi::FunctionReference())
  , bg_color_(Color(0, 0, 0))
  , fg_color_(Color(0, 0, 0))
  , font_(nullptr)
  , font_name_("")
  , t_start_(get_now_ms())
  , t_sync_ms_(0)
  , t_dsync_ms_(0)
  , shape_options_(ShapeOptions()) {
	auto env = info.Env();

	if (!info[0].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its first parameter to be an object of matrix options!");
	}
	if (!info[1].IsObject()) {
		throw Napi::Error::New(env, "Constructor expects its second parameter to be an object of runtime options!");
	}
	auto matrixOpts	 = create_matrix_options(env, info[0].As<Napi::Object>());
	auto runtimeOpts = create_runtime_options(env, info[1].As<Napi::Object>());

	this->matrix_ = CreateMatrixFromOptions(matrixOpts, runtimeOpts);
	this->canvas_ = this->matrix_->CreateFrameCanvas();

	if (this->matrix_ == NULL) {
		throw Napi::Error::New(env, "Failed to create matrix.");
	}
}

LedMatrixAddon::~LedMatrixAddon(void) {
	std::cerr << "Destroying matrix" << std::endl;
	delete matrix_;
}

Napi::Value LedMatrixAddon::sync(const Napi::CallbackInfo& info) {
	const char* data;
	size_t len;

	canvas_->Serialize(&data, &len);
	canvas_ = matrix_->SwapOnVSync(canvas_);
	if (!canvas_->Deserialize(data, len)) {
		throw Napi::Error::New(info.Env(), "Failed to sync canvas buffer with matrix.");
	}

	auto env = info.Env();

	if (!after_sync_cb_.IsEmpty()) {
		auto now	= get_now_ms();
		auto now_ms = now - t_start_;
		t_dsync_ms_ = now_ms - t_sync_ms_;
		t_sync_ms_	= now_ms;

		auto resync
		  = after_sync_cb_
			  .Call(info.This(), { info.This(), Napi::Number::New(env, t_dsync_ms_), Napi::Number::New(env, t_sync_ms_) });

		if (resync.ToBoolean() == true) {
			sync(info);
		}
	}

	return Napi::Number::New(env, 0);
}

Napi::Value LedMatrixAddon::after_sync(const Napi::CallbackInfo& info) {
	auto cb = info[0].As<Napi::Function>();

	assert(cb.IsFunction());

	after_sync_cb_ = Napi::Persistent(cb);
	after_sync_cb_.SuppressDestruct();

	return info.This();
}

Napi::Value LedMatrixAddon::map(const Napi::CallbackInfo& info) {
	auto cb = info[0].As<Napi::Function>();

	assert(cb.IsFunction());

	auto env	= info.Env();
	auto now	= get_now_ms();
	auto now_ms = Napi::Number::New(env, now - t_start_);

	Napi::Array coord_array = Napi::Array::New(env, 3);
	uint32_t zero			= 0; // The compiler can't match the overloaded signature if given 0 explicitly
	uint32_t one			= 1;
	uint32_t two			= 2;

	auto i = 0;

	for (int x = 0; x < this->matrix_->width(); x++) {
		coord_array.Set(zero, x);

		for (int y = 0; y < this->matrix_->height(); y++) {
			coord_array.Set(one, y);
			coord_array.Set(two, i++);

			auto color = cb.Call(info.This(), { coord_array, now_ms });

			assert(color.IsNumber());

			const auto hex = color.As<Napi::Number>().Uint32Value();
			this->matrix_->SetPixel(x, y, 0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
		}
	}

	return info.This();
}

Napi::Value LedMatrixAddon::brightness(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto brightness = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetBrightness(brightness);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->brightness());
	}
}

Napi::Value LedMatrixAddon::center(const Napi::CallbackInfo& info) {
	auto point = Napi::Array::New(info.Env(), 2);
	point.Set(uint32_t(0), Napi::Number::New(info.Env(), this->matrix_->width() / 2));
	point.Set(uint32_t(1), Napi::Number::New(info.Env(), this->matrix_->height() / 2));
	return point;
}

Napi::Value LedMatrixAddon::clear(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0	 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0	 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1	 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1	 = info[3].As<Napi::Number>().Uint32Value();
		const auto black = Color(0, 0, 0);
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->canvas_, x0, y, x1, y, black);
		}
	}
	else {
		this->canvas_->Clear();
	}
	return info.This();
}

Napi::Value LedMatrixAddon::draw_buffer(const Napi::CallbackInfo& info) {
	const auto buffer = info[0].As<Napi::Buffer<uint8_t>>();
	const auto w	  = info[1].IsNumber() ? info[1].As<Napi::Number>().Uint32Value() : this->matrix_->width();
	const auto h	  = info[2].IsNumber() ? info[2].As<Napi::Number>().Uint32Value() : this->matrix_->height();
	const auto data	  = buffer.Data();
	const auto len	  = buffer.Length();

	assert(len == w * h * 3);

	Image* img	  = new Image();
	Pixel* pixels = (Pixel*) malloc(sizeof(Pixel) * w * h);
	for (unsigned int i = 0; i < w * h; i++) {
		auto j = i * 3;
		Pixel p;
		p.r(data[j]);
		p.g(data[j + 1]);
		p.b(data[j + 2]);
		pixels[i] = p;
	}

	img->setPixels(w, h, pixels);

	assert(img->isValid());

	for (unsigned int y = 0; y < h; y++) {
		if (y > h) break;
		for (unsigned int x = 0; x < w; x++) {
			if (x > w) break;
			auto pixel = img->getPixel(x, y);
			this->canvas_->SetPixel(x, y, pixel.r(), pixel.g(), pixel.b());
		}
	}

	delete img;

	return info.This();
}

Napi::Value LedMatrixAddon::draw_circle(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	const auto r = info[2].As<Napi::Number>().Uint32Value();
	DrawCircle(this->canvas_, x, y, r, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::unstable_draw_circle(const Napi::CallbackInfo& info) {
	const auto opts = info[0].As<Napi::Object>();
	assert(opts.IsObject());
	const auto center	 = Point::from_tuple_value(opts.Get("center"));
	const auto x0		 = center.x;
	const auto y0		 = center.y;
	const int32_t radius = opts.Get("r").As<Napi::Number>().Int32Value();
	assert(radius >= 0);
	const auto stroke_color = color_from_napi_value_or_default(opts.Get("stroke"), fg_color_);
	const bool disable_fill = opts.Get("fill").IsUndefined();
	const auto fill_color	= color_from_napi_value_or_default(opts.Get("fill"), bg_color_);

	int x			= radius;
	int y			= 0;
	int radiusError = 1 - x;

	while (y <= x) {
		if (!disable_fill && y != radius) {
			DrawLine(this->canvas_, -y + x0, -x + y0 + 1, y + x0, -x + y0 + 1, fill_color);
			DrawLine(this->canvas_, y + x0, x + y0 - 1, -y + x0, x + y0 - 1, fill_color);
			DrawLine(this->canvas_, x + x0 - 1, y + y0, -x + x0 + 1, y + y0, fill_color);
			DrawLine(this->canvas_, -x + x0 + 1, -y + y0, x + x0 - 1, -y + y0, fill_color);
		}

		this->canvas_->SetPixel(-y + x0, -x + y0, stroke_color.r, stroke_color.g, stroke_color.b);
		this->canvas_->SetPixel(y + x0, -x + y0, stroke_color.r, stroke_color.g, stroke_color.b);

		this->canvas_->SetPixel(y + x0, x + y0, stroke_color.r, stroke_color.g, stroke_color.b);
		this->canvas_->SetPixel(-y + x0, x + y0, stroke_color.r, stroke_color.g, stroke_color.b);

		this->canvas_->SetPixel(-x + x0, -y + y0, stroke_color.r, stroke_color.g, stroke_color.b);
		this->canvas_->SetPixel(x + x0, -y + y0, stroke_color.r, stroke_color.g, stroke_color.b);

		this->canvas_->SetPixel(x + x0, y + y0, stroke_color.r, stroke_color.g, stroke_color.b);
		this->canvas_->SetPixel(-x + x0, y + y0, stroke_color.r, stroke_color.g, stroke_color.b);

		y++;

		if (radiusError < 0)
			radiusError += 2 * y + 1;
		else {
			x--;
			radiusError += 2 * (y - x + 1);
		}
	}

	return info.This();
}

Napi::Value LedMatrixAddon::unstable_draw_rectangle(const Napi::CallbackInfo& info) {
	const auto opts = info[0].As<Napi::Object>();
	assert(opts.IsObject());
	auto p0 = Point::from_tuple_value(opts.Get("p0"));
	auto p1
	  = opts.Has("p1")
		  ? Point::from_tuple_value(opts.Get("p1"))
		  : Point(p0.x + opts.Get("w").As<Napi::Number>().Int32Value(), p0.y + opts.Get("h").As<Napi::Number>().Int32Value());
	assert(p1 >= p0);

	const uint32_t stroke_width
	  = opts.Get("strokeWidth").IsUndefined() ? 1 : opts.Get("strokeWidth").As<Napi::Number>().Uint32Value();
	const auto stroke_color = color_from_napi_value_or_default(opts.Get("stroke"), fg_color_);
	const bool disable_fill = opts.Get("fill").IsUndefined();
	const auto fill_color	= color_from_napi_value_or_default(opts.Get("fill"), bg_color_);

	// If stroke width is 1 and there's no fill, just draw the edges and be done
	for (uint32_t i = 0; i < stroke_width; i++) {
		if (p0 >= p1) break;
		DrawLine(this->canvas_, p0.x, p0.y, p1.x, p0.y, stroke_color);
		DrawLine(this->canvas_, p1.x, p0.y, p1.x, p1.y, stroke_color);
		DrawLine(this->canvas_, p1.x, p1.y, p0.x, p1.y, stroke_color);
		DrawLine(this->canvas_, p0.x, p1.y, p0.x, p0.y, stroke_color);
		++p0;
		--p1;
	}

	// If fill is enabled, use the now-shrunken p0 and p1 to draw horizontal edges
	if (!disable_fill) {
		for (auto y = p0.y; y <= p1.y; y++) {
			DrawLine(this->canvas_, p0.x, y, p1.x, y, fill_color);
		}
	}

	return info.This();
}

bool compareDoublesEqual(double a, double b) {
	return std::abs(a - b) < (double) 0.000001;
}

Napi::Value LedMatrixAddon::unstable_draw_polygon(const Napi::CallbackInfo& info) {
	const auto opts = info[0].As<Napi::Object>();
	assert(opts.IsObject());
	const auto stroke_color = color_from_napi_value_or_default(opts.Get("stroke"), fg_color_);
	const bool disable_fill = opts.Get("fill").IsUndefined();
	const auto fill_color	= color_from_napi_value_or_default(opts.Get("fill"), bg_color_);

	assert(opts.Get("ps").IsArray());
	const auto tuple_array = opts.Get("ps").As<Napi::Array>();
	const auto count	   = tuple_array.Length();
	assert(count > 1);

	std::vector<Edge> edges;
	Point points[count];
	Point p0	 = Point::from_tuple_value(tuple_array[uint32_t(0)]);
	auto mins	 = p0;
	auto maxs	 = p0;
	Point p_prev = p0;
	Point p_curr;

	for (uint32_t i = 1; i < count; i++) {
		p_curr = Point::from_tuple_value(tuple_array[i]);
		mins.minimize(p_curr);
		maxs.maximize(p_curr);
		edges.push_back(Edge(p_curr, p_prev));
		DrawLine(this->canvas_, p_prev.x, p_prev.y, p_curr.x, p_curr.y, stroke_color);

		if (i == count - 1) {
			edges.push_back(Edge(p_curr, p0));
			DrawLine(this->canvas_, p_curr.x, p_curr.y, p0.x, p0.y, stroke_color);
		}

		p_prev = p_curr;
	}

	if (disable_fill) return info.This();

	uint32_t width	= maxs.x - mins.x + 1;
	uint32_t height = maxs.y - mins.y + 1;

	bool fill_flag = false; // Running flag for filling polygon point-by-point.

	for (uint32_t p = 0; p < width * height; p++) {
		// Ray casting coordinates
		double y = mins.y + floor(p / width);
		double x = mins.x + (p % width);

		if (x == mins.x) {
			fill_flag = false;
		}

		std::vector<int> line_indexes_at_p; // Vector of index of line within "edges" vector.
		int edges_at_p = 0;					// Like The Rentals' song.  :)

		// Loop through all edges at this point, p.
		for (uint32_t i = 0; i < edges.size(); i++) {
			if (
			  ((y == (int) round((edges[i].m * x) + edges[i].b) && edges[i].m == 0)
			   || (x == (int) round((y - edges[i].b) / edges[i].m)) || isinf(edges[i].m))
			  && (((x >= edges[i].x0 && x <= edges[i].x1) || (x >= edges[i].x1 && x <= edges[i].x0)) && ((y >= edges[i].y0 && y <= edges[i].y1) || (y >= edges[i].y1 && y <= edges[i].y0)))) {
				line_indexes_at_p.push_back(i);
				edges_at_p++;
			}
		}
		// Fill logic start

		// At a vertex vs. a line.
		if (edges_at_p > 1) {
			auto e0 = edges[line_indexes_at_p[0]];
			auto e1 = edges[line_indexes_at_p[1]];

			// Here's where it gets nuts.
			// How many edges does the imaginary ray (y += 0.001) cross and if more than one, are the points on each
			// line on same side of the imaginary line. Calculate the imaginary x on each line of imaginary y.
			double imaginary_y	= y + 0.001;
			double imaginary_x0 = (imaginary_y - e0.b) / e0.m; // Division by zero is happening.TODO
			double imaginary_x1 = (imaginary_y - e1.b) / e1.m;

			// We have our imaginary y and our imaginary xes.  Are these valid points on each line?
			bool imaginary_0_valid_point
			  = ((compareDoublesEqual(imaginary_y, (e0.m * imaginary_x0) + e0.b)) && ((imaginary_x0 >= e0.x0 && imaginary_x0 <= e0.x1) || (imaginary_x0 <= e0.x0 && imaginary_x0 >= e0.x1)));
			bool imaginary_1_valid_point
			  = ((compareDoublesEqual(imaginary_y, (e1.m * imaginary_x1) + e1.b)) && ((imaginary_x1 >= e1.x0 && imaginary_x1 <= e1.x1) || (imaginary_x1 <= e1.x0 && imaginary_x1 >= e1.x1)));

			// If an imaginary point exists on each of the edges, toggle on and then off. (2 in my old thinking)
			if (imaginary_0_valid_point & imaginary_1_valid_point) {
				this->canvas_->SetPixel(x, y, fill_color.r, fill_color.g, fill_color.b);
			}
			// If an imaginary point exists on only one line (because of a cusp, for example), we've only crossed one
			// line, effectively treating this as a side instead of a vertex.  Toggle fill on or off.
			if (imaginary_0_valid_point ^ imaginary_1_valid_point) {
				fill_flag = !fill_flag;
			}
		}

		// At a line vs. a vertex.
		if (edges_at_p == 1 && edges[line_indexes_at_p[0]].m != 0) { // And slope != 0
			fill_flag = !fill_flag;
		}

		if (fill_flag) {
			this->canvas_->SetPixel(x, y, fill_color.r, fill_color.g, fill_color.b);
		}
		// Fill logic end
	}

	return info.This();
}

// Color LedMatrixAddon::color_from_napi_value_or_default(const Napi::Value& value, const Color& default_color) {
// 	if (value.IsArray()) {
// 		auto arr = value.As<Napi::Array>();
// 		assert(arr.Length() == 3);
// 		uint8_t r = arr.Get(uint32_t(0)).As<Napi::Number>().Uint32Value();
// 		uint8_t g = arr.Get(uint32_t(1)).As<Napi::Number>().Uint32Value();
// 		uint8_t b = arr.Get(uint32_t(2)).As<Napi::Number>().Uint32Value();
// 		return Color(r, g, b);
// 	}
// 	else if (value.IsObject()) {
// 		const auto obj = value.As<Napi::Object>();
// 		uint8_t r	   = obj.Get("r").As<Napi::Number>().Uint32Value();
// 		uint8_t g	   = obj.Get("g").As<Napi::Number>().Uint32Value();
// 		uint8_t b	   = obj.Get("b").As<Napi::Number>().Uint32Value();
// 		return Color(r, g, b);
// 	}
// 	else if (value.IsNumber()) {
// 		const auto hex = value.As<Napi::Number>().Uint32Value();
// 		return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
// 	}
// 	else {
// 		return default_color;
// 	}
// }

Napi::Value LedMatrixAddon::draw_line(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto x1 = info[2].As<Napi::Number>().Uint32Value();
	const auto y1 = info[3].As<Napi::Number>().Uint32Value();
	DrawLine(this->canvas_, x0, y0, x1, y1, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::draw_rect(const Napi::CallbackInfo& info) {
	const auto x0 = info[0].As<Napi::Number>().Uint32Value();
	const auto y0 = info[1].As<Napi::Number>().Uint32Value();
	const auto w  = info[2].As<Napi::Number>().Uint32Value();
	const auto h  = info[3].As<Napi::Number>().Uint32Value();

	DrawLine(this->canvas_, x0, y0, x0 + w, y0, fg_color_);
	DrawLine(this->canvas_, x0 + w, y0, x0 + w, y0 + h, fg_color_);
	DrawLine(this->canvas_, x0 + w, y0 + h, x0, y0 + h, fg_color_);
	DrawLine(this->canvas_, x0, y0 + h, x0, y0, fg_color_);

	return info.This();
}

Napi::Value LedMatrixAddon::draw_text(const Napi::CallbackInfo& info) {
	if (!font_) throw Napi::Error::New(info.Env(), "Cannot draw text because the font has not been set!");
	const auto text		= std::string(info[0].As<Napi::String>()).c_str();
	const auto x		= info[1].As<Napi::Number>().Int32Value();
	const auto y		= info[2].As<Napi::Number>().Int32Value();
	const auto k		= info[3].IsNumber() ? info[3].As<Napi::Number>().Int32Value() : 0;
	const auto bg_color = bg_color_.r == 0 && bg_color_.g == 0 && bg_color_.b == 0 ? nullptr : &bg_color_;
	DrawText(this->canvas_, *font_, x, y + font_->baseline(), fg_color_, bg_color, text, k);

	return info.This();
}

Napi::Value LedMatrixAddon::fill(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		const auto x0 = info[0].As<Napi::Number>().Uint32Value();
		const auto y0 = info[1].As<Napi::Number>().Uint32Value();
		const auto x1 = info[2].As<Napi::Number>().Uint32Value();
		const auto y1 = info[3].As<Napi::Number>().Uint32Value();
		for (auto y = y0; y <= y1; y++) {
			DrawLine(this->canvas_, x0, y, x1, y, fg_color_);
		}
	}
	else {
		this->canvas_->Fill(fg_color_.r, fg_color_.g, fg_color_.b);
	}
	return info.This();
}

Napi::Value LedMatrixAddon::height(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->height());
}

Napi::Value LedMatrixAddon::width(const Napi::CallbackInfo& info) {
	return Napi::Number::New(info.Env(), this->matrix_->width());
}

Napi::Value LedMatrixAddon::luminance_correct(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsBoolean()) {
		auto correct = info[0].As<Napi::Boolean>().ToBoolean();
		this->matrix_->set_luminance_correct(correct);
		return info.This();
	}
	else {
		return Napi::Boolean::New(info.Env(), this->matrix_->luminance_correct());
	}
}

Napi::Value LedMatrixAddon::pwm_bits(const Napi::CallbackInfo& info) {
	if (info.Length() > 0 && info[0].IsNumber()) {
		auto bits = info[0].As<Napi::Number>().Uint32Value();
		this->matrix_->SetPWMBits(bits);
		return info.This();
	}
	else {
		return Napi::Number::New(info.Env(), this->matrix_->pwmbits());
	}
}

Napi::Value LedMatrixAddon::set_pixel(const Napi::CallbackInfo& info) {
	const auto x = info[0].As<Napi::Number>().Uint32Value();
	const auto y = info[1].As<Napi::Number>().Uint32Value();
	this->canvas_->SetPixel(x, y, fg_color_.r, fg_color_.g, fg_color_.b);

	return info.This();
}

Napi::Value LedMatrixAddon::fg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto color = LedMatrixAddon::color_from_callback_info(info);
		fg_color_  = color;
		return info.This();
	}
	else {
		return color_into_napi_object(info.Env(), fg_color_);
	}
}

Napi::Value LedMatrixAddon::bg_color(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto color = LedMatrixAddon::color_from_callback_info(info);
		bg_color_  = color;
		return info.This();
	}
	else {
		return color_into_napi_object(info.Env(), bg_color_);
	}
}

Napi::Value LedMatrixAddon::shape_options(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		assert(info[0].IsObject());
		const auto opts = info[0].As<Napi::Object>();
		shape_options_.apply_napi_value(opts);
		auto color = LedMatrixAddon::color_from_callback_info(info);
		bg_color_  = color;
		return info.This();
	}
	else {
		return shape_options_.into_napi_value(info.Env());
	}
}

Napi::Value LedMatrixAddon::font(const Napi::CallbackInfo& info) {
	if (info.Length() > 0) {
		auto font	= Napi::ObjectWrap<FontAddon>::Unwrap(info[0].As<Napi::Object>());
		this->font_ = &(font->font);
		font_name_	= font->name(info).ToString();
		return info.This();
	}
	else {
		return Napi::String::New(info.Env(), font_name_);
	}
}

Napi::Value LedMatrixAddon::get_available_pixel_mappers(const Napi::CallbackInfo& info) {
	auto env					  = info.Env();
	auto mappers				  = GetAvailablePixelMappers();
	Napi::Array mapper_name_array = Napi::Array::New(env, mappers.size());
	for (uint8_t i = 0; i < mappers.size(); i++) mapper_name_array.Set(i, Napi::String::New(env, mappers.at(i)));

	return mapper_name_array;
}

/**
 * Create an instance of Options from a JS object.
 */
RGBMatrix::Options LedMatrixAddon::create_matrix_options(const Napi::Env& env, const Napi::Object& obj) {
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
	if (!options.Validate(&error)) throw Napi::Error::New(env, error);
	return options;
}

/**
 * Create an instance of RuntimeOptions from a JS object.
 */
RuntimeOptions LedMatrixAddon::create_runtime_options(const Napi::Env& env, const Napi::Object& obj) {
	RuntimeOptions options	= RuntimeOptions();
	options.gpio_slowdown	= obj.Get("gpioSlowdown").As<Napi::Number>();
	options.daemon			= obj.Get("daemon").As<Napi::Number>();
	options.drop_privileges = obj.Get("dropPrivileges").As<Napi::Number>();
	options.do_gpio_init	= obj.Get("doGpioInit").As<Napi::Boolean>();

	return options;
}

/**
 * Create a JS object from an instance of RGBMatrix::Options.
 */
Napi::Object LedMatrixAddon::matrix_options_to_obj(const Napi::Env& env, const RGBMatrix::Options& options) {
	auto obj					  = Napi::Object::New(env);
	obj["brightness"]			  = Napi::Number::New(env, options.brightness);
	obj["chainLength"]			  = Napi::Number::New(env, options.chain_length);
	obj["cols"]					  = Napi::Number::New(env, options.cols);
	obj["disableHardwarePulsing"] = Napi::Boolean::New(env, options.disable_hardware_pulsing);
	obj["hardwareMapping"]		  = options.hardware_mapping == NULL ? "" : std::string(options.hardware_mapping);
	obj["inverseColors"]		  = Napi::Boolean::New(env, options.inverse_colors);
	obj["ledRgbSequence"]		  = options.led_rgb_sequence == NULL ? "" : std::string(options.led_rgb_sequence);
	obj["limitRefreshRateHz"]	  = Napi::Number::New(env, options.limit_refresh_rate_hz);
	obj["multiplexing"]			  = Napi::Number::New(env, options.multiplexing);
	obj["panelType"]			  = options.panel_type == NULL ? "" : std::string(options.panel_type);
	obj["parallel"]				  = Napi::Number::New(env, options.parallel);
	obj["pixelMapperConfig"]	  = options.pixel_mapper_config == NULL ? "" : std::string(options.pixel_mapper_config);
	obj["pwmBits"]				  = Napi::Number::New(env, options.pwm_bits);
	obj["pwmDitherBits"]		  = Napi::Number::New(env, options.pwm_dither_bits);
	obj["pwmLsbNanoseconds"]	  = Napi::Number::New(env, options.pwm_lsb_nanoseconds);
	obj["rowAddressType"]		  = Napi::Number::New(env, options.row_address_type);
	obj["rows"]					  = Napi::Number::New(env, options.rows);
	obj["scanMode"]				  = Napi::Number::New(env, options.scan_mode);
	obj["showRefreshRate"]		  = Napi::Boolean::New(env, options.show_refresh_rate);

	return obj;
}

/**
 * Create a JS object from an instance of RuntimeOptions.
 */
Napi::Object LedMatrixAddon::runtime_options_to_obj(const Napi::Env& env, const RuntimeOptions& options) {
	auto obj			  = Napi::Object::New(env);
	obj["daemon"]		  = Napi::Number::New(env, options.daemon);
	obj["doGpioInit"]	  = Napi::Boolean::New(env, options.do_gpio_init);
	obj["dropPrivileges"] = Napi::Number::New(env, options.drop_privileges);
	obj["gpioSlowdown"]	  = Napi::Number::New(env, options.gpio_slowdown);

	return obj;
}

/**
 * Create a JS object from the default matrix options.
 */
Napi::Value LedMatrixAddon::default_matrix_options(const Napi::CallbackInfo& info) {
	auto env		   = info.Env();
	const auto options = RGBMatrix::Options();
	return LedMatrixAddon::matrix_options_to_obj(env, options);
}

/**
 * Create a JS object from the default runtime options.
 */
Napi::Value LedMatrixAddon::default_runtime_options(const Napi::CallbackInfo& info) {
	auto env = info.Env();
	return LedMatrixAddon::runtime_options_to_obj(env, RuntimeOptions());
}

/**
 * Create a Color instance from CallbackInfo.
 */
Color LedMatrixAddon::color_from_callback_info(const Napi::CallbackInfo& info) {
	if (info.Length() == 3) {
		uint8_t r = info[0].As<Napi::Number>().Uint32Value();
		uint8_t g = info[1].As<Napi::Number>().Uint32Value();
		uint8_t b = info[2].As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsObject()) {
		const auto obj = info[0].As<Napi::Object>();
		uint8_t r	   = obj.Get("r").As<Napi::Number>().Uint32Value();
		uint8_t g	   = obj.Get("g").As<Napi::Number>().Uint32Value();
		uint8_t b	   = obj.Get("b").As<Napi::Number>().Uint32Value();
		return Color(r, g, b);
	}
	else if (info[0].IsNumber()) {
		const auto hex = info[0].As<Napi::Number>().Uint32Value();
		return Color(0xFF & (hex >> 16), 0xFF & (hex >> 8), 0xFF & hex);
	}
	else {
		throw Napi::Error::New(info.Env(), "Failed to create color from parameters.");
	}
}
