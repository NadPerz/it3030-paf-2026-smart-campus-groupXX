package com.smartcampus.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String code;
}