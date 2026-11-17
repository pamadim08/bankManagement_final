package com.example.backend.dto;

import java.util.List;

import org.springframework.data.domain.Page;

public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> fromPage(Page<T> p) {
        return new PageResponse<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
    }
}
