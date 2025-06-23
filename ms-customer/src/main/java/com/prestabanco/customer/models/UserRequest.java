package com.prestabanco.customer.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRequest {
    private String name;
    private String firstName;
    private String lastName;
    private String email;
    private Integer age;
    private String password;
}
