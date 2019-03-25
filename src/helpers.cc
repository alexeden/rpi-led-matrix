#ifndef HELPERS_NS
#define HELPERS_NS

#include <string>
#include <cstring>

namespace helpers {
	static char* string_to_c_str(const std::string &str) {
		char *cptr = new char[str.size()];
		strcpy(cptr, str.c_str());
		return cptr;
	}
}

#endif
