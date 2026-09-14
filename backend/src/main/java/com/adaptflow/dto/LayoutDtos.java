package com.adaptflow.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class LayoutDtos {

    public record CreateLayoutRequest(
            @NotBlank(message = "Layout name is required")
            String name
    ) {}

    public record UpdateLayoutRequest(
            String name,
            String description,
            String schemaJson,
            Double version
    ) {}

    public record LayoutSummaryDto(
            String id,
            String name,
            String thumbnailUrl,
            List<String> surfaceTypes,
            int variationCount,
            String description,
            double version,
            String createdAt,
            String updatedAt
    ) {}
}
