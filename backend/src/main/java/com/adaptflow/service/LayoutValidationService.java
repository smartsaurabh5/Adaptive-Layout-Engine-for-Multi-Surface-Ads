package com.adaptflow.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class LayoutValidationService {

    private final ObjectMapper objectMapper;

    private static final Set<String> VALID_ELEMENT_TYPES = Set.of("text", "image", "button", "logo", "shape");
    private static final Set<String> VALID_STRATEGIES = Set.of("fit", "fill", "reflow", "hide");
    private static final Set<String> VALID_ANCHORS = Set.of(
            "top-left", "top-center", "top-right",
            "center-left", "center", "center-right",
            "bottom-left", "bottom-center", "bottom-right"
    );

    public LayoutValidationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<String> validateSchemaJson(String schemaJson) {
        List<String> errors = new ArrayList<>();

        if (schemaJson == null || schemaJson.trim().isEmpty()) {
            errors.add("Schema JSON cannot be empty");
            return errors;
        }

        try {
            JsonNode root = objectMapper.readTree(schemaJson);

            if (!root.hasNonNull("id")) {
                errors.add("Schema must have an id");
            }
            if (!root.hasNonNull("name") || root.get("name").asText().trim().isEmpty()) {
                errors.add("Schema must have a non-empty name");
            }

            if (!root.has("elements") || !root.get("elements").isArray()) {
                errors.add("Schema must have an elements array");
                return errors;
            }

            JsonNode elements = root.get("elements");
            Set<String> elementIds = new HashSet<>();

            for (int i = 0; i < elements.size(); i++) {
                JsonNode el = elements.get(i);
                String eid = el.hasNonNull("id") ? el.get("id").asText() : "element[" + i + "]";

                if (!el.hasNonNull("id") || el.get("id").asText().trim().isEmpty()) {
                    errors.add("Element at index " + i + " must have a non-empty id");
                } else if (!elementIds.add(eid)) {
                    errors.add("Duplicate element id found: " + eid);
                }

                if (!el.hasNonNull("type") || !VALID_ELEMENT_TYPES.contains(el.get("type").asText())) {
                    errors.add("Element " + eid + " has invalid type. Supported: " + VALID_ELEMENT_TYPES);
                }

                if (el.has("scalingStrategy") && !VALID_STRATEGIES.contains(el.get("scalingStrategy").asText())) {
                    errors.add("Element " + eid + " has invalid scalingStrategy. Supported: " + VALID_STRATEGIES);
                }

                if (el.has("anchor") && !VALID_ANCHORS.contains(el.get("anchor").asText())) {
                    errors.add("Element " + eid + " has invalid anchor. Supported: " + VALID_ANCHORS);
                }
            }

        } catch (Exception e) {
            errors.add("Malformed JSON: " + e.getMessage());
        }

        return errors;
    }

    public void validateOrThrow(String schemaJson) {
        List<String> errors = validateSchemaJson(schemaJson);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Invalid layout schema: " + String.join("; ", errors));
        }
    }
}
