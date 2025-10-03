package ru.example.server;

import lombok.AllArgsConstructor;

import java.util.List;

import static ru.example.server.Constants.CONTENT_TYPE_JSON;
import static ru.example.server.Constants.CRLF;
import static ru.example.server.Constants.STATUS_200;
import static ru.example.server.Constants.STATUS_400;
import static ru.example.server.Constants.STATUS_500;

@AllArgsConstructor
public class Response {
    private final int status;
    private final Object body;

    public String toHttpString() {
        String statusLine = switch (status) {
            case 200 -> STATUS_200;
            case 400 -> STATUS_400;
            case 500 -> STATUS_500;
            default -> STATUS_500;
        };

        String jsonBody = body instanceof List
                ? convertHistoryToJson((List<HitResult>) body)
                : "{}";

        return new StringBuilder()
                .append(statusLine)
                .append(CONTENT_TYPE_JSON)
                .append(CRLF)
                .append(jsonBody)
                .toString();
    }

    private String convertHistoryToJson(List<HitResult> history) {
        StringBuilder sb = new StringBuilder().append('[');
        for (int i = 0; i < history.size(); i++) {
            HitResult r = history.get(i);
            sb.append(String.format(
                    Constants.JSON_TEMPLATE,
                    r.getX(), r.getY(), r.getR(), r.isHit(), r.getTimestamp(), r.getExecTimeNanos()
            ));
            if (i < history.size() - 1) {
                sb.append(',');
            }
        }
        return sb.append(']').toString();
    }
}