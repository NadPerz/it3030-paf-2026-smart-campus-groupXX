package com.smartcampus.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public List<String> saveAll(List<MultipartFile> files, String subDir) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            validateFile(file);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(uploadDir, subDir, filename);
            try {
                Files.createDirectories(path.getParent());
                Files.copy(file.getInputStream(), path,
                        StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                throw new RuntimeException("Failed to save file: " + filename, e);
            }
            urls.add("/uploads/" + subDir + "/" + filename);
        }
        return urls;
    }

    private void validateFile(MultipartFile file) {
        List<String> allowed = List.of(
                "image/jpeg", "image/png", "image/webp");
        if (!allowed.contains(file.getContentType()))
            throw new RuntimeException(
                    "Invalid file type. Only jpg, png, webp allowed.");
        if (file.getSize() > 5 * 1024 * 1024)
            throw new RuntimeException("File too large. Max 5MB.");
    }
}