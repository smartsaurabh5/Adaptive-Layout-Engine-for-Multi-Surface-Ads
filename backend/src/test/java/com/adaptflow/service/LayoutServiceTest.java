package com.adaptflow.service;

import com.adaptflow.dto.LayoutDtos.CreateLayoutRequest;
import com.adaptflow.dto.LayoutDtos.LayoutSummaryDto;
import com.adaptflow.dto.LayoutDtos.UpdateLayoutRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class LayoutServiceTest {

    @Autowired
    private LayoutService layoutService;

    @Test
    void createAndGetLayout_success() {
        CreateLayoutRequest createReq = new CreateLayoutRequest("Holiday Sale Banner");
        LayoutSummaryDto summary = layoutService.createLayout(createReq, "elena@flam.io");

        assertNotNull(summary);
        assertNotNull(summary.id());
        assertEquals("Holiday Sale Banner", summary.name());

        String schemaJson = layoutService.getLayoutSchema(summary.id());
        assertNotNull(schemaJson);
        assertTrue(schemaJson.contains("Holiday Sale Banner"));
    }

    @Test
    void listLayouts_returnsInitializedOrCreatedLayouts() {
        List<LayoutSummaryDto> list = layoutService.listLayouts();
        assertNotNull(list);
        assertFalse(list.isEmpty(), "Layout list should contain seeded or created layouts");
    }

    @Test
    void updateLayout_updatesNameAndSchema() {
        CreateLayoutRequest createReq = new CreateLayoutRequest("Original Name");
        LayoutSummaryDto created = layoutService.createLayout(createReq, "elena@flam.io");

        String updatedSchema = """
        {
          "id": "%s",
          "name": "Updated Name",
          "elements": [
            {
              "id": "btn-1",
              "type": "button",
              "anchor": "center",
              "scalingStrategy": "fit"
            }
          ]
        }
        """.formatted(created.id());

        UpdateLayoutRequest updateReq = new UpdateLayoutRequest("Updated Name", "New description", updatedSchema, 2.0);
        layoutService.updateLayout(created.id(), updateReq, "elena@flam.io");

        String fetched = layoutService.getLayoutSchema(created.id());
        assertTrue(fetched.contains("btn-1"));
        assertTrue(fetched.contains("Updated Name"));
    }

    @Test
    void deleteLayout_removesLayout() {
        CreateLayoutRequest createReq = new CreateLayoutRequest("To Be Deleted");
        LayoutSummaryDto created = layoutService.createLayout(createReq, "elena@flam.io");

        layoutService.deleteLayout(created.id(), "elena@flam.io");

        assertThrows(IllegalArgumentException.class, () -> layoutService.getLayoutSchema(created.id()));
    }
}
