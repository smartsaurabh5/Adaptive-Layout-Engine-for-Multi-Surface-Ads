package com.adaptflow.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping({"/", "/api", "/api/health"})
    public ResponseEntity<Map<String, Object>> rootHealthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("service", "AdaptFlow Backend API");
        response.put("status", "UP");
        response.put("version", "1.0.0");
        response.put("timestamp", Instant.now().toString());

        Map<String, String> endpoints = new LinkedHashMap<>();
        endpoints.put("surfaces", "/api/surfaces");
        endpoints.put("layouts", "/api/layouts");
        endpoints.put("assets", "/api/assets");
        endpoints.put("auth_login", "POST /api/auth/login");
        endpoints.put("auth_register", "POST /api/auth/register");
        response.put("endpoints", endpoints);

        return ResponseEntity.ok(response);
    }
}
