package com.adaptflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "surfaces")
public class Surface {

    @Id
    @Column(nullable = false, updatable = false, length = 64)
    private String id;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false)
    private Integer width;

    @Column(nullable = false)
    private Integer height;

    @Column(nullable = false, length = 64)
    private String type;

    @Column(name = "min_supported_width", nullable = false)
    private Integer minSupportedWidth;

    public Surface() {
    }

    public Surface(String id, String name, Integer width, Integer height, String type, Integer minSupportedWidth) {
        this.id = id;
        this.name = name;
        this.width = width;
        this.height = height;
        this.type = type;
        this.minSupportedWidth = minSupportedWidth;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getMinSupportedWidth() {
        return minSupportedWidth;
    }

    public void setMinSupportedWidth(Integer minSupportedWidth) {
        this.minSupportedWidth = minSupportedWidth;
    }
}
