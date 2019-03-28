#ifndef HELPERS_NS
#define HELPERS_NS

#include <cstring>
#include <string>

namespace helpers
{
	static char *string_to_c_str(const std::string &str) {
		char *cptr = new char[str.size()];
		strcpy(cptr, str.c_str());
		return cptr;
	}
} // namespace helpers

#endif
