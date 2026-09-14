package com.adaptflow.controller;

import com.adaptflow.dto.AssetDtos.AssetDto;
import com.adaptflow.service.AssetService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GetMapping
    public ResponseEntity<List<AssetDto>> listAssets() {
        return ResponseEntity.ok(assetService.listAssets());
    }

    @PostMapping(value = {"/upload", ""}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetDto> uploadAsset(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "tags", required = false) String tags,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        AssetDto asset = assetService.uploadAsset(file, tags, userEmail);
        return ResponseEntity.ok(asset);
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> getAssetFile(@PathVariable String id) throws IOException {
        Resource resource = assetService.loadAssetAsResource(id);

        String contentType = "application/octet-stream";
        if (resource.getFilename() != null) {
            String fn = resource.getFilename().toLowerCase();
            if (fn.endsWith(".svg")) contentType = "image/svg+xml";
            else if (fn.endsWith(".png")) contentType = "image/png";
            else if (fn.endsWith(".jpg") || fn.endsWith(".jpeg")) contentType = "image/jpeg";
            else if (fn.endsWith(".webp")) contentType = "image/webp";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}
