package com.dumply;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DumplyApplication {

    public static void main(String[] args) {
        SpringApplication.run(DumplyApplication.class, args);
    }
}
