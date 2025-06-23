package com.prestabanco.customer.controller;

import com.prestabanco.customer.entity.User;
import com.prestabanco.customer.config.JwtUtil;
import com.prestabanco.customer.models.*;
import com.prestabanco.customer.service.UserService;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RefreshScope
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/login")
    public ResponseEntity<UserLoginResponse> loginUser(@RequestBody UserLoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        UserLoginResponse response = userService.loginUser(request);
        if (response == null || response.getUserId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        String token = jwtUtil.generateToken(request.getEmail());
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@RequestBody UserRequest user) {
        UserResponse userSaved = userService.registerUser(user);
        if (userSaved.getId() == 2) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(userSaved);
        }

        if (userSaved.getId() == 3) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(userSaved);
        }

        return ResponseEntity.ok(userSaved);
    }

    @PutMapping("/")
    public ResponseEntity<User> updateUser( @RequestBody User user) {
        User userSaved = userService.updateUser(user);
        return ResponseEntity.ok(userSaved);
    }

}