#include <math.h>
#include <pixel-mapper.h>

class ChainLinkPixelMapper : public rgb_matrix::PixelMapper {
  public:
	ChainLinkPixelMapper() {
	}

	virtual const char *GetName() const {
		return "Chainlink";
	}

	virtual bool SetParameters(int chain, int parallel, const char *param) {
		chain_	  = chain;
		parallel_ = parallel;

		return true;
	}

	virtual bool GetSizeMapping(int matrix_width, int matrix_height, int *visible_width, int *visible_height) const {
		*visible_height = matrix_height / parallel_;
		*visible_width	= matrix_width * parallel_;

		return true;
	}

	virtual void
	MapVisibleToMatrix(int matrix_width, int matrix_height, int x, int y, int *matrix_x, int *matrix_y) const {
		*matrix_x = (x % matrix_width);
		*matrix_y = (matrix_height / parallel_) * floor(x / matrix_width) + y;
	}

  private:
	int chain_;
	int parallel_;
};
