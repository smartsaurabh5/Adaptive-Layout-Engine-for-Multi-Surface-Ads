package com.adaptflow.controller;

import com.adaptflow.dto.LayoutDtos.*;
import com.adaptflow.service.LayoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/layouts")
public class LayoutController {

    private final LayoutService layoutService;

    public LayoutController(LayoutService layoutService) {
        this.layoutService = layoutService;
    }

    @GetMapping
    public ResponseEntity<List<LayoutSummaryDto>> listLayouts() {
        return ResponseEntity.ok(layoutService.listLayouts());
    }

    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getLayout(@PathVariable String id) {
        String schemaJson = layoutService.getLayoutSchema(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .body(schemaJson);
    }

    @PostMapping
    public ResponseEntity<LayoutSummaryDto> createLayout(@Valid @RequestBody CreateLayoutRequest request,
                                                         @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        LayoutSummaryDto created = layoutService.createLayout(request, userEmail);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateLayout(@PathVariable String id,
                                                            @RequestBody UpdateLayoutRequest request,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        layoutService.updateLayout(id, request, userEmail);
        return ResponseEntity.ok(Map.of("message", "Layout updated successfully", "id", id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteLayout(@PathVariable String id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        layoutService.deleteLayout(id, userEmail);
        return ResponseEntity.ok(Map.of("message", "Layout deleted successfully", "id", id));
    }
}
