package com.smartcampus.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;
import javax.imageio.ImageIO;

@Service
public class QRCodeService {

    private static final String BASE_URL = "http://localhost:3000";

    /**
     * Generates a base64-encoded PNG QR code.
     * Encodes a URL so iOS/Android camera opens it directly in browser.
     */
    public String generateQRCode(String bookingId) {
        try {
            String qrContent = BASE_URL + "/check-in?bookingId=" + bookingId;
            QRCodeWriter writer = new QRCodeWriter();
            BitMatrix matrix = writer.encode(qrContent, BarcodeFormat.QR_CODE, 250, 250);
            BufferedImage image = MatrixToImageWriter.toBufferedImage(matrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, "PNG", baos);
            return Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (WriterException | IOException e) {
            throw new RuntimeException("Failed to generate QR code for booking: " + bookingId, e);
        }
    }

    /**
     * Extracts bookingId from QR token.
     * Supports URL format: http://localhost:3000/check-in?bookingId=xxx
     */
    public String verifyQRCode(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Invalid QR token");
        }
        if (token.contains("bookingId=")) {
            String[] parts = token.split("bookingId=");
            if (parts.length > 1) return parts[1].split("&")[0];
        }
        if (token.startsWith("SMARTCAMPUS:BOOKING:")) {
            return token.substring("SMARTCAMPUS:BOOKING:".length());
        }
        return token;
    }
}