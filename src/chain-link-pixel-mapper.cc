#include <pixel-mapper.h>

class ChainLinkPixelMapper : public rgb_matrix::PixelMapper {
  public:
	ChainLinkPixelMapper() {
	}

	virtual const char *GetName() const {
		return "Chainlink";
	}

    virtual bool SetParameters(int chain, int parallel, const char *param) {
        return true;
    }

    virtual bool GetSizeMapping(int matrix_width, int matrix_height, int *visible_width, int *visible_height) const {
        return true;
    }

    virtual void MapVisibleToMatrix(int matrix_width, int matrix_height, int x, int y, int *matrix_x, int *matrix_y) const {
    }
};
