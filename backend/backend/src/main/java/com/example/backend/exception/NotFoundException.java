package com.example.backend.exception;

/** Thrown when a requested resource (for example an account) does not exist. Mapped to HTTP 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
