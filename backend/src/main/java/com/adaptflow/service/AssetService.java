package com.adaptflow.service;

import com.adaptflow.dto.AssetDtos.AssetDto;
import com.adaptflow.model.Asset;
import com.adaptflow.model.User;
import com.adaptflow.repository.AssetRepository;
import com.adaptflow.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    @Value("${adaptflow.upload.dir:./uploads}")
    private String uploadDir;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/svg+xml", "image/png", "image/jpeg", "image/webp", "image/gif"
    );

    public AssetService(AssetRepository assetRepository, UserRepository userRepository) {
        this.assetRepository = assetRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void initStorageAndSeeds() {
        try {
            Path path = Paths.get(uploadDir);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload folder: " + e.getMessage(), e);
        }

        if (assetRepository.count() == 0) {
            User demoUser = userRepository.findAll().stream().findFirst().orElse(null);
            assetRepository.saveAll(List.of(
                    new Asset("asset-1", "AdaptFlow-Mark-Dark.svg", "SVG", "image/svg+xml", 12288L, "", "Primary Brand,Vector Ready", demoUser),
                    new Asset("asset-2", "Acoustic-Pro-Headphones-Cutout.png", "PNG", "image/png", 2516582L, "", "Cutout,Transparent", demoUser),
                    new Asset("asset-3", "Summer-Warm-Glow-Backdrop.jpg", "JPG", "image/jpeg", 3985408L, "", "Campaigns,Full Bleed", demoUser),
                    new Asset("asset-4", "Watch-Ultra-Titanium.png", "PNG", "image/png", 1992294L, "", "E-Commerce,3D Render", demoUser),
                    new Asset("asset-5", "Brand-Accent-Gradient.png", "PNG", "image/png", 894520L, "", "Texture,Hero Fill", demoUser)
            ));
        }

        // Ensure physical asset files exist on disk and storage paths are properly assigned
        for (Asset asset : assetRepository.findAll()) {
            try {
                if (asset.getStoragePath() == null || asset.getStoragePath().isBlank() || !Files.exists(Paths.get(asset.getStoragePath()))) {
                    Path file = ensureSeededFile(asset);
                    asset.setStoragePath(file.toAbsolutePath().toString());
                    asset.setSizeBytes(Files.size(file));
                    assetRepository.save(asset);
                }
            } catch (Exception e) {
                System.err.println("Could not seed file for asset " + asset.getId() + ": " + e.getMessage());
            }
        }
    }

    public Path ensureSeededFile(Asset asset) throws IOException {
        Path dir = Paths.get(uploadDir);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        String fn = asset.getFileName() != null ? asset.getFileName() : asset.getId() + ".png";
        Path targetPath = dir.resolve(asset.getId() + "-" + fn);
        if (Files.exists(targetPath)) {
            return targetPath;
        }

        if (fn.toLowerCase().endsWith(".svg")) {
            String svgContent = """
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
                      <rect width="400" height="400" rx="32" fill="#0f172a"/>
                      <g transform="translate(100, 80)">
                        <rect width="200" height="200" rx="44" fill="#4f46e5"/>
                        <path d="M100 35 L165 90 V165 H35 V90 Z" fill="#ffffff" fill-opacity="0.95"/>
                        <path d="M65 110 H135 M100 75 V145" stroke="#4f46e5" stroke-width="14" stroke-linecap="round"/>
                      </g>
                      <text x="200" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">ADAPTFLOW</text>
                    </svg>
                    """;
            Files.writeString(targetPath, svgContent);
        } else if (fn.toLowerCase().endsWith(".jpg") || fn.toLowerCase().endsWith(".jpeg")) {
            BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            GradientPaint gp = new GradientPaint(0, 0, new Color(217, 119, 6), 800, 600, new Color(79, 70, 229));
            g.setPaint(gp);
            g.fillRect(0, 0, 800, 600);
            g.setColor(new Color(254, 240, 138, 180));
            g.fillOval(250, 150, 300, 300);
            g.dispose();
            ImageIO.write(img, "jpg", targetPath.toFile());
        } else {
            BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_ARGB);
            Graphics2D g = img.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            if (fn.toLowerCase().contains("headphone") || fn.toLowerCase().contains("acoustic")) {
                g.setColor(new Color(15, 23, 42));
                g.fillRect(0, 0, 800, 600);
                g.setColor(new Color(99, 102, 241));
                g.setStroke(new BasicStroke(16, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
                g.drawArc(260, 180, 280, 260, 0, 180);
                g.setColor(new Color(129, 140, 248));
                g.fillRoundRect(220, 280, 70, 140, 30, 30);
                g.fillRoundRect(510, 280, 70, 140, 30, 30);
            } else if (fn.toLowerCase().contains("watch") || fn.toLowerCase().contains("titanium")) {
                g.setColor(new Color(24, 24, 27));
                g.fillRect(0, 0, 800, 600);
                g.setColor(new Color(113, 113, 122));
                g.fillRoundRect(340, 100, 120, 80, 16, 16);
                g.fillRoundRect(340, 420, 120, 80, 16, 16);
                g.setColor(new Color(39, 39, 42));
                g.fillRoundRect(280, 160, 240, 280, 48, 48);
                g.setColor(new Color(249, 115, 22));
                g.setStroke(new BasicStroke(8));
                g.drawRoundRect(280, 160, 240, 280, 48, 48);
                g.setColor(new Color(9, 9, 11));
                g.fillOval(320, 220, 160, 160);
            } else {
                GradientPaint gp = new GradientPaint(0, 0, new Color(192, 38, 211), 800, 600, new Color(6, 182, 212));
                g.setPaint(gp);
                g.fillRect(0, 0, 800, 600);
            }
            g.dispose();
            ImageIO.write(img, "png", targetPath.toFile());
        }
        return targetPath;
    }

    @Transactional(readOnly = true)
    public List<AssetDto> listAssets() {
        return assetRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public AssetDto uploadAsset(MultipartFile file, String tags, String userEmail) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload empty file");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException("Unsupported file type: " + mimeType + ". Allowed: " + ALLOWED_MIME_TYPES);
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset-" + UUID.randomUUID();
        String fileExt = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toUpperCase() : "PNG";

        String assetId = "asset-" + UUID.randomUUID();
        String storedFilename = assetId + "-" + originalFilename;
        Path targetPath = Paths.get(uploadDir).resolve(storedFilename);

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        User owner = userEmail != null ? userRepository.findByEmail(userEmail).orElse(null) : null;

        Asset asset = new Asset(
                assetId,
                originalFilename,
                fileExt,
                mimeType,
                file.getSize(),
                targetPath.toString(),
                tags != null ? tags : "",
                owner
        );

        assetRepository.save(asset);
        return toDto(asset);
    }

    @Transactional
    public Resource loadAssetAsResource(String id) throws IOException {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found with id: " + id));

        String storagePath = asset.getStoragePath();
        Path filePath = (storagePath != null && !storagePath.isBlank()) ? Paths.get(storagePath) : null;

        if (filePath == null || !Files.exists(filePath)) {
            filePath = ensureSeededFile(asset);
            asset.setStoragePath(filePath.toAbsolutePath().toString());
            asset.setSizeBytes(Files.size(filePath));
            assetRepository.save(asset);
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read asset file");
        }
    }

    private AssetDto toDto(Asset asset) {
        List<String> tagList = asset.getTags() != null && !asset.getTags().isEmpty()
                ? Arrays.stream(asset.getTags().split(",")).map(String::trim).toList()
                : List.of();

        String fileUrl = "/api/assets/" + asset.getId() + "/file";

        return new AssetDto(
                asset.getId(),
                asset.getFileName(),
                asset.getFileType(),
                asset.getMimeType(),
                asset.getSizeBytes(),
                fileUrl,
                tagList,
                asset.getUsedInLayouts(),
                asset.getCreatedAt().toString()
        );
    }
}
