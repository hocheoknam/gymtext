package com.gym.place;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot应用主入口类
 * 用于启动经纬度转地点名称的服务
 */
@SpringBootApplication
public class PlaceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(PlaceApplication.class, args);
    }
}
