package com.adaptflow.dto;

public class SurfaceDtos {

    public record SurfaceDto(
            String id,
            String name,
            int width,
            int height,
            String type,
            int minSupportedWidth
    ) {}
}
