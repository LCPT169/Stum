package com.stumdet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC配置类，用于配置API路径前缀
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    /**
     * 配置API路径前缀
     * @param configurer 路径匹配配置器
     */
    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        // 为所有控制器添加/api前缀
        configurer.addPathPrefix("/api", clazz -> true);
    }
}
