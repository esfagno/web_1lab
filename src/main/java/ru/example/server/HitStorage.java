package ru.example.server;

import java.util.ArrayList;
import java.util.List;


public class HitStorage {
    private static final List<HitResult> results = new ArrayList<>();
    private static final Object lock = new Object();

    public static void add(HitResult result) {
        synchronized (lock) {
            results.add(result);
        }
    }

    public static List<HitResult> getAll() {
        synchronized (lock) {
            return new ArrayList<>(results);
        }
    }
}
