package com.adaptflow.service;

import com.adaptflow.dto.SurfaceDtos.SurfaceDto;
import com.adaptflow.model.Surface;
import com.adaptflow.repository.SurfaceRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SurfaceService {

    private final SurfaceRepository surfaceRepository;

    public SurfaceService(SurfaceRepository surfaceRepository) {
        this.surfaceRepository = surfaceRepository;
    }

    @PostConstruct
    @Transactional
    public void initDefaultSurfaces() {
        if (surfaceRepository.count() == 0) {
            surfaceRepository.saveAll(List.of(
                    new Surface("surface-banner", "Web Banner (Medium Rectangle)", 300, 250, "banner", 200),
                    new Surface("surface-leaderboard", "Leaderboard (Web Display)", 728, 90, "leaderboard", 468),
                    new Surface("surface-square", "Square (Feed & Instagram Post)", 1080, 1080, "square", 400),
                    new Surface("surface-story", "Vertical Story (Reels, TikTok, Stories)", 1080, 1920, "story", 360),
                    new Surface("surface-skyscraper", "Skyscraper (Desktop Sidebar)", 160, 600, "skyscraper", 120)
            ));
        }
    }

    @Transactional(readOnly = true)
    public List<SurfaceDto> getAllSurfaces() {
        return surfaceRepository.findAll().stream()
                .map(s -> new SurfaceDto(
                        s.getId(),
                        s.getName(),
                        s.getWidth(),
                        s.getHeight(),
                        s.getType(),
                        s.getMinSupportedWidth()
                ))
                .toList();
    }
}
