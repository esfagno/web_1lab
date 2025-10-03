package ru.example.server;

import static ru.example.server.Constants.ERROR_R_OUT_OF_RANGE;
import static ru.example.server.Constants.ERROR_X_INVALID_VALUE;
import static ru.example.server.Constants.ERROR_Y_OUT_OF_RANGE;
import static ru.example.server.Constants.PARAM_R;
import static ru.example.server.Constants.PARAM_X;
import static ru.example.server.Constants.PARAM_Y;

public class InputValidator {
    private static final double GEOMETRY_EPSILON = 0.000001;
    private static final double[] VALID_X_VALUES = {-2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0};

    private final double x;
    private final double y;
    private final double r;

    public InputValidator(double x, double y, double r) {
        this.x = x;
        this.y = y;
        this.r = r;
    }

    public void validate() {
        validateR();
        validateX();
        validateY();
    }

    private void validateR() {
        if (r != Math.floor(r) || r < 1 || r > 5) {
            throw new ValidationException(PARAM_R, ERROR_R_OUT_OF_RANGE);
        }
    }

    private void validateX() {
        for (double validX : VALID_X_VALUES) {
            if (Math.abs(x - validX) < GEOMETRY_EPSILON) {
                return;
            }
        }
        throw new ValidationException(PARAM_X, ERROR_X_INVALID_VALUE);
    }

    private void validateY() {
        if (y <= -5 || y >= 5) {
            throw new ValidationException(PARAM_Y, ERROR_Y_OUT_OF_RANGE)
                    ;
        }
    }
}