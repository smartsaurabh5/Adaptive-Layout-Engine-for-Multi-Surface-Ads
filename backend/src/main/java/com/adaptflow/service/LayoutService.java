package com.adaptflow.service;

import com.adaptflow.dto.LayoutDtos.*;
import com.adaptflow.model.Layout;
import com.adaptflow.model.User;
import com.adaptflow.repository.LayoutRepository;
import com.adaptflow.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class LayoutService {

    private final LayoutRepository layoutRepository;
    private final UserRepository userRepository;
    private final LayoutValidationService validationService;
    private final ObjectMapper objectMapper;

    public LayoutService(LayoutRepository layoutRepository,
                         UserRepository userRepository,
                         LayoutValidationService validationService,
                         ObjectMapper objectMapper) {
        this.layoutRepository = layoutRepository;
        this.userRepository = userRepository;
        this.validationService = validationService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<LayoutSummaryDto> listLayouts() {
        List<Layout> layouts = layoutRepository.findAllByOrderByUpdatedAtDesc();
        return layouts.stream().map(this::toSummaryDto).toList();
    }

    @Transactional(readOnly = true)
    public String getLayoutSchema(String id) {
        Layout layout = layoutRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Layout not found with id: " + id));
        return layout.getSchemaJson();
    }

    @Transactional
    public LayoutSummaryDto createLayout(CreateLayoutRequest request, String userEmail) {
        User owner = resolveOwner(userEmail);
        String id = "layout-" + UUID.randomUUID();

        String blankSchema = String.format(
                "{\"id\":\"%s\",\"name\":\"%s\",\"elements\":[],\"backgroundColor\":\"#ffffff\",\"version\":1,\"createdAt\":\"%s\",\"updatedAt\":\"%s\"}",
                id, escapeJson(request.name()), Instant.now(), Instant.now()
        );

        Layout layout = new Layout(
                id,
                request.name(),
                "",
                blankSchema,
                owner,
                1.0
        );

        layoutRepository.save(layout);
        return toSummaryDto(layout);
    }

    @Transactional
    public void updateLayout(String id, UpdateLayoutRequest request, String userEmail) {
        Layout layout = layoutRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Layout not found with id: " + id));

        if (request.schemaJson() != null && !request.schemaJson().trim().isEmpty()) {
            validationService.validateOrThrow(request.schemaJson());
            layout.setSchemaJson(request.schemaJson());
        }

        if (request.name() != null && !request.name().trim().isEmpty()) {
            layout.setName(request.name().trim());
        }

        if (request.description() != null) {
            layout.setDescription(request.description());
        }

        if (request.version() != null) {
            layout.setVersion(request.version());
        }

        layout.setUpdatedAt(Instant.now());
        layoutRepository.save(layout);
    }

    @Transactional
    public void deleteLayout(String id, String userEmail) {
        Layout layout = layoutRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Layout not found with id: " + id));
        layoutRepository.delete(layout);
    }

    private User resolveOwner(String userEmail) {
        if (userEmail != null && !userEmail.isEmpty()) {
            return userRepository.findByEmail(userEmail)
                    .orElseGet(() -> createDefaultUser(userEmail));
        }
        return userRepository.findAll().stream().findFirst()
                .orElseGet(() -> createDefaultUser("admin@adaptflow.io"));
    }

    private User createDefaultUser(String email) {
        User defaultUser = new User(
                "user-" + UUID.randomUUID(),
                email,
                "$2a$12$e8x/yUvP3bkW7Qn9R1Hwte4f6g7h8i9j0k1l2m3n4o5p6q7r8s9t",
                "System User",
                com.adaptflow.model.Role.EDITOR
        );
        return userRepository.save(defaultUser);
    }

    private LayoutSummaryDto toSummaryDto(Layout layout) {
        List<String> surfaceTypes = new ArrayList<>();
        int variationCount = 3;

        try {
            JsonNode root = objectMapper.readTree(layout.getSchemaJson());
            if (root.has("elements") && root.get("elements").isArray()) {
                variationCount = Math.max(1, root.get("elements").size());
            }
        } catch (Exception ignored) {
        }

        surfaceTypes.add("banner");
        surfaceTypes.add("story");
        surfaceTypes.add("square");

        return new LayoutSummaryDto(
                layout.getId(),
                layout.getName(),
                "",
                surfaceTypes,
                variationCount,
                layout.getDescription() != null ? layout.getDescription() : "",
                layout.getVersion() != null ? layout.getVersion() : 1.0,
                layout.getCreatedAt().toString(),
                layout.getUpdatedAt().toString()
        );
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
