package ru.example.server;

public class HitChecker {
    public static boolean isHit(double x, double y, double r) {
        // прямоугольный треугольник
        if (x >= 0 && y >= 0 && y <= (-2 * x + r) / 2) {
            return true;
        }

        // прямоугольник
        if (x <= 0 && y >= 0 && x >= -r && y <= r / 2) {
            return true;
        }

        // четверть круга
        if (x <= 0 && y <= 0 && x * x + y * y <= r * r) {
            return true;
        }

        return false;
    }
}