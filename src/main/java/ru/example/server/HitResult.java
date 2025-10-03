package ru.example.server;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HitResult {
    private double x;
    private double y;
    private double r;
    private boolean hit;
    private String timestamp;
    private long execTimeNanos;
}