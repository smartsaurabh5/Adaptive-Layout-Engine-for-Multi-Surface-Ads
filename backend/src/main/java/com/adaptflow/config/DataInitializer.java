package com.adaptflow.config;

import com.adaptflow.model.Layout;
import com.adaptflow.model.Role;
import com.adaptflow.model.User;
import com.adaptflow.repository.LayoutRepository;
import com.adaptflow.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          LayoutRepository layoutRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                User elena = new User(
                        "user-1",
                        "elena@flam.io",
                        passwordEncoder.encode("password123"),
                        "Elena Rostova",
                        Role.EDITOR
                );
                userRepository.save(elena);

                User admin = new User(
                        "user-admin",
                        "admin@adaptflow.io",
                        passwordEncoder.encode("admin123"),
                        "Admin",
                        Role.ADMIN
                );
                userRepository.save(admin);

                if (layoutRepository.count() == 0) {
                    String sampleSchema1 = """
                    {
                      "id": "layout-1",
                      "name": "Nike Air Max Launch Q3",
                      "backgroundColor": "#0f172a",
                      "version": 2.4,
                      "elements": [
                        {
                          "id": "el-bg-glow",
                          "type": "shape",
                          "label": "Glow Accent",
                          "x": 0, "y": 0, "width": 100, "height": 100,
                          "anchor": "top-left",
                          "scalingStrategy": "fill",
                          "priority": 5,
                          "zIndex": 1,
                          "visible": true,
                          "locked": true,
                          "props": {
                            "shapeType": "rectangle",
                            "backgroundColor": "#1e1b4b",
                            "borderColor": "transparent",
                            "borderWidth": 0,
                            "borderRadius": 0,
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-logo",
                          "type": "logo",
                          "label": "Nike Swoosh",
                          "x": 6, "y": 6, "width": 18, "height": 8,
                          "anchor": "top-left",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 10,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "src": "",
                            "alt": "Nike",
                            "objectFit": "contain",
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-headline",
                          "type": "text",
                          "label": "Header Text",
                          "x": 8, "y": 20, "width": 84, "height": 15,
                          "anchor": "top-center",
                          "scalingStrategy": "reflow",
                          "priority": 1,
                          "zIndex": 10,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "AIR MAX PULSE",
                            "fontSize": 32,
                            "fontWeight": 800,
                            "fontFamily": "Inter",
                            "color": "#ffffff",
                            "textAlign": "center",
                            "lineHeight": 1.1,
                            "letterSpacing": -1
                          }
                        },
                        {
                          "id": "el-cta",
                          "type": "button",
                          "label": "CTA Button",
                          "x": 25, "y": 80, "width": 50, "height": 10,
                          "anchor": "bottom-center",
                          "scalingStrategy": "fit",
                          "priority": 2,
                          "zIndex": 10,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "label": "Shop Air Max",
                            "backgroundColor": "#6366f1",
                            "textColor": "#ffffff",
                            "fontSize": 14,
                            "fontWeight": 600,
                            "borderRadius": 8,
                            "paddingX": 20,
                            "paddingY": 10
                          }
                        }
                      ]
                    }
                    """;

                    Layout l1 = new Layout(
                            "layout-1",
                            "Nike Air Max Launch Q3",
                            "Footwear global seasonal push with programmatic resolution scaling",
                            sampleSchema1,
                            elena,
                            2.4
                    );
                    layoutRepository.save(l1);

                    String sampleSchema2 = """
                    {
                      "id": "layout-2",
                      "name": "AcousticPro Wireless Audio",
                      "backgroundColor": "#090d16",
                      "version": 2.0,
                      "elements": [
                        {
                          "id": "el-logo",
                          "type": "logo",
                          "label": "Brand Logo",
                          "x": 6, "y": 4, "width": 24, "height": 7,
                          "anchor": "top-left",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 10,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "src": "/api/assets/asset-1/file",
                            "alt": "AcousticPro Audio",
                            "objectFit": "contain",
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-badge",
                          "type": "text",
                          "label": "Season Badge",
                          "x": 10, "y": 12, "width": 80, "height": 5,
                          "anchor": "top-center",
                          "scalingStrategy": "fit",
                          "priority": 3,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "SPATIAL AUDIO PRO - SERIES 2",
                            "fontSize": 11,
                            "fontWeight": 700,
                            "fontFamily": "Inter",
                            "color": "#818cf8",
                            "textAlign": "center",
                            "lineHeight": 1.2,
                            "letterSpacing": 2,
                            "textTransform": "uppercase"
                          }
                        },
                        {
                          "id": "el-headline",
                          "type": "text",
                          "label": "Headline",
                          "x": 8, "y": 18, "width": 84, "height": 14,
                          "anchor": "top-center",
                          "scalingStrategy": "reflow",
                          "priority": 1,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "Next-Gen Performance Sound",
                            "fontSize": 26,
                            "fontWeight": 800,
                            "fontFamily": "Inter",
                            "color": "#f8fafc",
                            "textAlign": "center",
                            "lineHeight": 1.15,
                            "letterSpacing": -0.5
                          }
                        },
                        {
                          "id": "el-product-image",
                          "type": "image",
                          "label": "Headphones Cutout",
                          "x": 18, "y": 34, "width": 64, "height": 38,
                          "anchor": "center",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 6,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "src": "/api/assets/asset-2/file",
                            "alt": "AcousticPro Noise-Cancelling Headphones",
                            "objectFit": "contain",
                            "borderRadius": 12,
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-subtext",
                          "type": "text",
                          "label": "Subheading",
                          "x": 10, "y": 74, "width": 80, "height": 8,
                          "anchor": "bottom-center",
                          "scalingStrategy": "reflow",
                          "priority": 3,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "Spatial audio engineered for extreme focus and acoustic precision.",
                            "fontSize": 12,
                            "fontWeight": 400,
                            "fontFamily": "Inter",
                            "color": "#94a3b8",
                            "textAlign": "center",
                            "lineHeight": 1.35,
                            "letterSpacing": 0
                          }
                        },
                        {
                          "id": "el-cta",
                          "type": "button",
                          "label": "CTA Button",
                          "x": 15, "y": 85, "width": 70, "height": 9,
                          "anchor": "bottom-center",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 12,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "label": "Pre-order Now - $249",
                            "backgroundColor": "#4f46e5",
                            "textColor": "#ffffff",
                            "fontSize": 14,
                            "fontWeight": 700,
                            "borderRadius": 9999,
                            "paddingX": 22,
                            "paddingY": 10,
                            "icon": ""
                          }
                        }
                      ]
                    }
                    """;

                    Layout l2 = new Layout(
                            "layout-2",
                            "AcousticPro Wireless Audio",
                            "High-fidelity noise cancellation headphones promotional blitz across feed and story placements",
                            sampleSchema2,
                            elena,
                            2.0
                    );
                    layoutRepository.save(l2);
                }

                // Always sync layout-2 to latest rich creative schema
                layoutRepository.findById("layout-2").ifPresent(l -> {
                    l.setName("AcousticPro Wireless Audio");
                    l.setSchemaJson("""
                    {
                      "id": "layout-2",
                      "name": "AcousticPro Wireless Audio",
                      "backgroundColor": "#090d16",
                      "version": 2.0,
                      "elements": [
                        {
                          "id": "el-logo",
                          "type": "logo",
                          "label": "Brand Logo",
                          "x": 6, "y": 4, "width": 24, "height": 7,
                          "anchor": "top-left",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 10,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "src": "/api/assets/asset-1/file",
                            "alt": "AcousticPro Audio",
                            "objectFit": "contain",
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-badge",
                          "type": "text",
                          "label": "Season Badge",
                          "x": 10, "y": 12, "width": 80, "height": 5,
                          "anchor": "top-center",
                          "scalingStrategy": "fit",
                          "priority": 3,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "SPATIAL AUDIO PRO - SERIES 2",
                            "fontSize": 11,
                            "fontWeight": 700,
                            "fontFamily": "Inter",
                            "color": "#818cf8",
                            "textAlign": "center",
                            "lineHeight": 1.2,
                            "letterSpacing": 2,
                            "textTransform": "uppercase"
                          }
                        },
                        {
                          "id": "el-headline",
                          "type": "text",
                          "label": "Headline",
                          "x": 8, "y": 18, "width": 84, "height": 14,
                          "anchor": "top-center",
                          "scalingStrategy": "reflow",
                          "priority": 1,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "Next-Gen Performance Sound",
                            "fontSize": 26,
                            "fontWeight": 800,
                            "fontFamily": "Inter",
                            "color": "#f8fafc",
                            "textAlign": "center",
                            "lineHeight": 1.15,
                            "letterSpacing": -0.5
                          }
                        },
                        {
                          "id": "el-product-image",
                          "type": "image",
                          "label": "Headphones Cutout",
                          "x": 18, "y": 34, "width": 64, "height": 38,
                          "anchor": "center",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 6,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "src": "/api/assets/asset-2/file",
                            "alt": "AcousticPro Noise-Cancelling Headphones",
                            "objectFit": "contain",
                            "borderRadius": 12,
                            "opacity": 1
                          }
                        },
                        {
                          "id": "el-subtext",
                          "type": "text",
                          "label": "Subheading",
                          "x": 10, "y": 74, "width": 80, "height": 8,
                          "anchor": "bottom-center",
                          "scalingStrategy": "reflow",
                          "priority": 3,
                          "zIndex": 8,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "content": "Spatial audio engineered for extreme focus and acoustic precision.",
                            "fontSize": 12,
                            "fontWeight": 400,
                            "fontFamily": "Inter",
                            "color": "#94a3b8",
                            "textAlign": "center",
                            "lineHeight": 1.35,
                            "letterSpacing": 0
                          }
                        },
                        {
                          "id": "el-cta",
                          "type": "button",
                          "label": "CTA Button",
                          "x": 15, "y": 85, "width": 70, "height": 9,
                          "anchor": "bottom-center",
                          "scalingStrategy": "fit",
                          "priority": 1,
                          "zIndex": 12,
                          "visible": true,
                          "locked": false,
                          "props": {
                            "label": "Pre-order Now - $249",
                            "backgroundColor": "#4f46e5",
                            "textColor": "#ffffff",
                            "fontSize": 14,
                            "fontWeight": 700,
                            "borderRadius": 9999,
                            "paddingX": 22,
                            "paddingY": 10,
                            "icon": ""
                          }
                        }
                      ]
                    }
                    """);
                    layoutRepository.save(l);
                });
            }
        };
    }
}
