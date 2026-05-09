package com.training.scheduling.exception;

import java.time.Instant;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ValidationErrorResponse {
    private Instant timestamp;
    private int status;
    private Map<String, String> errors;
}

