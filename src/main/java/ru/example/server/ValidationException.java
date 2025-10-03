package ru.example.server;

public class ValidationException extends RuntimeException {
    private final String field;
    private final String reason;

    public ValidationException(String field, String reason) {
        super(String.format("Validation error in '%s': %s", field, reason));
        this.field = field;
        this.reason = reason;
    }

    public String toJson() {
        String timestamp = java.time.LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME
        );
        return String.format(
                "{\"error\":{\"field\":\"%s\",\"message\":\"%s\",\"timestamp\":\"%s\"}}",
                field, reason.replace("\"", "\\\""), timestamp
        );
    }
}
