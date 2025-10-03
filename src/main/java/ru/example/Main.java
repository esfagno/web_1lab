package ru.example;

import com.fastcgi.FCGIInterface;
import ru.example.server.Handler;

import java.util.Map;


public class Main {
    public static void main(String[] args) {
        System.err.println("FastCGI-сервер запущен");

        FCGIInterface fcgi = new FCGIInterface();

        while (true) {
            try {
                int ret = fcgi.FCGIaccept();
                if (ret < 0) {
                    Thread.sleep(1000);
                    continue;
                }

                String contentLengthStr = System.getProperty("CONTENT_LENGTH", "0");
                int contentLength = Integer.parseInt(contentLengthStr);
                byte[] bodyBytes = new byte[contentLength];
                System.in.read(bodyBytes);
                String body = new String(bodyBytes);

                Map<String, String> params = Handler.parseFormData(body);
                String response = Handler.handle(params);

                System.out.print(response);
                System.out.flush();

            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}