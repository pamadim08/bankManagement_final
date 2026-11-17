package com.example.backend.exception;

import java.util.HashMap;
import java.util.Map;

public class ValidationException extends RuntimeException {
    private final Map<String, String> errors = new HashMap<>();

    public ValidationException(String field, String message) {
        super(message);
        this.errors.put(field, message);
    }

    public ValidationException(Map<String, String> errors) {
        super("ข้อมูลไม่ถูกต้องตามเงื่อนไข");
        this.errors.putAll(errors);
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
