package com.adaptflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class LayoutValidationServiceTest {

    private LayoutValidationService validationService;

    @BeforeEach
    void setUp() {
        validationService = new LayoutValidationService(new ObjectMapper());
    }

    @Test
    void validateSchemaJson_validSchema_returnsNoErrors() {
        String validJson = """
        {
          "id": "layout-test-1",
          "name": "Summer Promo",
          "elements": [
            {
              "id": "el-1",
              "type": "text",
              "anchor": "top-center",
              "scalingStrategy": "reflow"
            },
            {
              "id": "el-2",
              "type": "button",
              "anchor": "bottom-center",
              "scalingStrategy": "fit"
            }
          ]
        }
        """;

        List<String> errors = validationService.validateSchemaJson(validJson);
        assertTrue(errors.isEmpty(), "Valid schema should have no errors");
    }

    @Test
    void validateSchemaJson_missingNameOrId_returnsErrors() {
        String invalidJson = """
        {
          "elements": []
        }
        """;

        List<String> errors = validationService.validateSchemaJson(invalidJson);
        assertFalse(errors.isEmpty());
        assertTrue(errors.stream().anyMatch(e -> e.contains("id")));
        assertTrue(errors.stream().anyMatch(e -> e.contains("name")));
    }

    @Test
    void validateSchemaJson_duplicateElementIds_returnsError() {
        String duplicateIdJson = """
        {
          "id": "layout-test-dup",
          "name": "Dup Elements",
          "elements": [
            { "id": "btn-1", "type": "button" },
            { "id": "btn-1", "type": "button" }
          ]
        }
        """;

        List<String> errors = validationService.validateSchemaJson(duplicateIdJson);
        assertTrue(errors.stream().anyMatch(e -> e.contains("Duplicate element id")));
    }

    @Test
    void validateSchemaJson_invalidElementType_returnsError() {
        String invalidTypeJson = """
        {
          "id": "layout-test-type",
          "name": "Invalid Type",
          "elements": [
            { "id": "el-unknown", "type": "unsupported-widget" }
          ]
        }
        """;

        List<String> errors = validationService.validateSchemaJson(invalidTypeJson);
        assertTrue(errors.stream().anyMatch(e -> e.contains("invalid type")));
    }

    @Test
    void validateSchemaJson_malformedJson_returnsError() {
        String malformedJson = "{ not a valid json }";

        List<String> errors = validationService.validateSchemaJson(malformedJson);
        assertTrue(errors.stream().anyMatch(e -> e.contains("Malformed JSON")));
    }
}
