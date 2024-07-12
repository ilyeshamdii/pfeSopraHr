package com.bezkoder.springjwt.util;

public class UploadResponse {
    private String message;
    private String pdfPath;
    private boolean success;

    public UploadResponse(String message, String pdfPath, boolean success) {
        this.message = message;
        this.pdfPath = pdfPath;
        this.success = success;
    }

    // Getters for message, pdfPath, and success
    // You can generate them using your IDE or manually
}