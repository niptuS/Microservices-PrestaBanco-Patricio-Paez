package com.prestabanco.executive.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExecutiveLoginResponse {
    private Long id;
    private String token;
}
