package ru.example.server;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static ru.example.server.Constants.ERROR_INVALID_NUMBER_FORMAT;
import static ru.example.server.Constants.ERROR_MISSING_PARAMETERS;
import static ru.example.server.Constants.ERROR_VALUE_CANNOT_BE_EMPTY;
import static ru.example.server.Constants.PARAM_R;
import static ru.example.server.Constants.PARAM_X;
import static ru.example.server.Constants.PARAM_Y;

public class Handler {
    public static Map<String, String> parseFormData(String body) {
        Map<String, String> params = new HashMap<>();
        if (body == null || body.isEmpty()) return params;

        for (String pair : body.split("&")) {
            String[] split = pair.split("=", 2);
            if (split.length == 2) {
                try {
                    String key = URLDecoder.decode(split[0], StandardCharsets.UTF_8);
                    String value = URLDecoder.decode(split[1], StandardCharsets.UTF_8);
                    params.put(key, value);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return params;
    }

    private static double parseDouble(String value, String field) {
        return Optional.ofNullable(value).filter(v -> !v.trim().isEmpty()).map(v -> {
            try {
                return Double.parseDouble(v);
            } catch (NumberFormatException e) {
                throw new ValidationException(field, ERROR_INVALID_NUMBER_FORMAT);
            }
        }).orElseThrow(() -> new ValidationException(field, ERROR_VALUE_CANNOT_BE_EMPTY));
    }

    public static String handle(Map<String, String> params) {
        try {
            validateRequiredParams(params, PARAM_X, PARAM_Y, PARAM_R);

            double x = parseDouble(params.get(PARAM_X), PARAM_X);
            double y = parseDouble(params.get(PARAM_Y), PARAM_Y);
            double r = parseDouble(params.get(PARAM_R), PARAM_R);

            new InputValidator(x, y, r).validate();

            long start = System.nanoTime();
            boolean hit = HitChecker.isHit(x, y, r);
            long execTimeNanos = System.nanoTime() - start;

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            HitResult hitResult = HitResult.builder().x(x).y(y).r(r).hit(hit).timestamp(timestamp).execTimeNanos(execTimeNanos).build();

            HitStorage.add(hitResult);

            return new Response(200, HitStorage.getAll()).toHttpString();
        } catch (ValidationException e) {
            return new Response(400, e).toHttpString();
        } catch (Exception e) {
            return new Response(500, e).toHttpString();
        }
    }

    private static void validateRequiredParams(Map<String, String> params, String... requiredParams) {
        List<String> missing = new ArrayList<>();
        for (String param : requiredParams) {
            String value = params.get(param);
            if (value == null || value.trim().isEmpty()) {
                missing.add(param);
            }
        }
        throw new ValidationException("parameters", String.format(ERROR_MISSING_PARAMETERS, String.join(", ", missing)));
    }
}