package ru.example.server;

public class Constants {
    public static final String CRLF = "\r\n";
    public static final String STATUS_200 = "Status: 200 OK" + CRLF;
    public static final String STATUS_400 = "Status: 400 Bad Request" + CRLF;
    public static final String STATUS_500 = "Status: 500 Internal Server Error" + CRLF;
    public static final String CONTENT_TYPE_JSON = "Content-Type: application/json; charset=UTF-8" + CRLF;

    public static final String PARAM_X = "x";
    public static final String PARAM_Y = "y";
    public static final String PARAM_R = "r";

    public static final String ERROR_R_OUT_OF_RANGE = "R must be between 1 and 5";
    public static final String ERROR_X_INVALID_VALUE = "X must be in {-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2}";
    public static final String ERROR_Y_OUT_OF_RANGE = "Y must be between -5 and 5";
    public static final String ERROR_INVALID_NUMBER_FORMAT = "Invalid number format";
    public static final String ERROR_VALUE_CANNOT_BE_EMPTY = "Value cannot be empty";
    public static final String ERROR_MISSING_PARAMETERS = "Missing required parameters: %s";

    public static final String JSON_TEMPLATE =
            "{\"x\":%.2f,\"y\":%.2f,\"r\":%.2f,\"hit\":%b,\"timestamp\":\"%s\",\"execTimeNanos\":%d}";}