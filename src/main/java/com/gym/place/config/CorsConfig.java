package com.gym.place.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS配置类
 * 允许前端访问API
 */
@Configuration
public class CorsConfig {
    
    /**
     * 配置CORS策略
     * @return WebMvcConfigurer实例
     */
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")  // 对所有/api路径下的接口启用CORS
                        .allowedOrigins("http://localhost:3000", "http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:8888", "http://127.0.0.1:3000", "http://127.0.0.1:8080", "http://127.0.0.1:8081", "http://127.0.0.1:8082", "http://127.0.0.1:8083", "http://127.0.0.1:8888")  // 允许多个常见的前端开发端口
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")  // 允许的HTTP方法
                        .allowedHeaders("*")  // 允许的请求头
                        .allowCredentials(true)  // 允许携带凭证
                        .maxAge(3600);  // 预检请求缓存时间（秒）
            }
        };
    }
}