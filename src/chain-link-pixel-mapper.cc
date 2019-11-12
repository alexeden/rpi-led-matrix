#include <pixel-mapper.h>

class ChainLinkPixelMapper : public rgb_matrix::PixelMapper {
  public:
	ChainLinkPixelMapper() {
        fprintf(
            stderr,
            "I am ChainLinkPixelMapper\n"
        );
	}

	virtual const char *GetName() const {
		return "Chainlink";
	}

	virtual bool SetParameters(int chain, int parallel, const char *param) {
        chain_ = chain;
        parallel_ = parallel;
        fprintf(
            stdout,
            "ChainLinkPixelMapper parameters: parallel=%d, chain=%d",
            parallel_,
            chain_
        );
		return true;
	}

	virtual bool GetSizeMapping(int matrix_width, int matrix_height, int *visible_width, int *visible_height) const {

        *visible_height = matrix_height / parallel_;
        *visible_width = matrix_width * parallel_;
        // *visible_height =
        fprintf(
            stderr,
            "size mapping height=%d, width=%d",
            matrix_height,
            matrix_width
        );
        fprintf(
            stderr,
            "visible dimensions height=%d, width=%d",
            *visible_height,
            *visible_width
        );
		return true;
	}

	virtual void
	MapVisibleToMatrix(int matrix_width, int matrix_height, int x, int y, int *matrix_x, int *matrix_y) const {
        fprintf(
            stderr,
            "MapVisibleToMatrix matrix height=%d, width=%d",
            matrix_height,
            matrix_width
        );
	}

  private:
	int chain_;
	int parallel_;
};
