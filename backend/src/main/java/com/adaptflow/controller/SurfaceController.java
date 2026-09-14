package com.adaptflow.controller;

import com.adaptflow.dto.SurfaceDtos.SurfaceDto;
import com.adaptflow.service.SurfaceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/surfaces")
public class SurfaceController {

    private final SurfaceService surfaceService;

    public SurfaceController(SurfaceService surfaceService) {
        this.surfaceService = surfaceService;
    }

    @GetMapping
    public ResponseEntity<List<SurfaceDto>> listSurfaces() {
        return ResponseEntity.ok(surfaceService.getAllSurfaces());
    }
}
