package com.bezkoder.springjwt.util;
public class BadgeNotFoundException extends RuntimeException {
    public BadgeNotFoundException(String message) {
        super(message);
    }
}
