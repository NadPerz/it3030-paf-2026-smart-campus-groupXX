package com.smartcampus.service;

import org.springframework.stereotype.Service;

/**
 * QR code generation and verification service — Member 2 responsibility (innovation feature).
 *
 * TODO (Member 2): Implement using the ZXing library (already in pom.xml):
 *
 *   generateQRCode(Long bookingId):
 *     1. Create a payload string (e.g. "booking:{bookingId}:{uuid}")
 *     2. Use com.google.zxing.qrcode.QRCodeWriter to encode the payload
 *     3. Use MatrixToImageWriter to render to a ByteArrayOutputStream as PNG
 *     4. Base64-encode the PNG bytes and return as a data URI string
 *        (e.g. "data:image/png;base64,<encoded>")
 *
 *   verifyQRCode(String token):
 *     1. Decode the token to extract bookingId
 *     2. Look up the booking in BookingRepository
 *     3. Validate that the booking is APPROVED and not already checked in
 *     4. Return the booking or throw BadRequestException on failure
 */
@Service
public class QRCodeService {

    public String generateQRCode(Long bookingId) {
        // TODO (Member 2): Implement using ZXing
        throw new UnsupportedOperationException("TODO: Member 2 — implement generateQRCode()");
    }

    public Long verifyQRCode(String token) {
        // TODO (Member 2): Implement — decode and validate QR token, return bookingId
        throw new UnsupportedOperationException("TODO: Member 2 — implement verifyQRCode()");
    }
}
