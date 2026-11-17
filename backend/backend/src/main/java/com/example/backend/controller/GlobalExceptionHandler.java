package com.example.backend.controller;

import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

/**
 * Maps exceptions to a consistent {"error": "..."} JSON body.
 * Standard Spring MVC problems (malformed JSON, wrong HTTP method, unknown path, bad parameter type)
 * keep their proper 4xx status via {@link ResponseEntityExceptionHandler}.
 */
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(ValidationException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", ex.getMessage());
        body.put("fieldErrors", ex.getErrors());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorBody(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadInput(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorBody(ex.getMessage()));
    }

    /** Unexpected failures: log the details, but never leak internal messages to the client. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleError(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง"));
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        if (statusCode.is5xxServerError()) {
            log.error("Server error handling request", ex);
        }
        return ResponseEntity.status(statusCode).headers(headers).body(errorBody(messageFor(statusCode.value())));
    }

    private static String messageFor(int status) {
        return switch (status) {
            case 400 -> "รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง";
            case 404 -> "ไม่พบข้อมูลที่ร้องขอ";
            case 405 -> "ไม่รองรับวิธีการเรียกนี้";
            case 415 -> "ไม่รองรับรูปแบบข้อมูลนี้";
            default -> status >= 500 ? "เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง" : "คำขอไม่สำเร็จ";
        };
    }

    private static Map<String, Object> errorBody(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", message);
        return body;
    }
}
