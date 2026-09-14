package com.adaptflow.dto;

import java.util.List;

public class AssetDtos {

    public record AssetDto(
            String id,
            String fileName,
            String fileType,
            String mimeType,
            long sizeBytes,
            String url,
            List<String> tags,
            int usedInLayouts,
            String createdAt
    ) {}
}
