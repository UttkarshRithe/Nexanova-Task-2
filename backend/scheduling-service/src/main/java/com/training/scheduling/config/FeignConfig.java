package com.training.scheduling.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            String token = extractTokenFromSecurityContext();
            if (token == null || token.isBlank()) {
                token = extractTokenFromRequestHeader();
            }
            if (token == null || token.isBlank()) {
                return;
            }

            System.out.println("🔥 FORWARDED TOKEN: " + token);
            template.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        };
    }

    private String extractTokenFromSecurityContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getCredentials() == null) {
            return null;
        }
        String value = authentication.getCredentials().toString();
        if (value.startsWith("Bearer ")) {
            return value.substring(7);
        }
        return value;
    }

    private String extractTokenFromRequestHeader() {
        if (!(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attrs)) {
            return null;
        }
        HttpServletRequest request = attrs.getRequest();
        if (request == null) {
            return null;
        }
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        if (authorization.startsWith("Bearer ")) {
            return authorization.substring(7);
        }
        return authorization;
    }
}