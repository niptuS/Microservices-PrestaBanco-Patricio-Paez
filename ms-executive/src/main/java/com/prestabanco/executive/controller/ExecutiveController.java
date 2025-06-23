package com.prestabanco.executive.controller;

import com.prestabanco.executive.config.JwtUtil;
import com.prestabanco.executive.entity.Executive;
import com.prestabanco.executive.models.ExecutiveLoginRequest;
import com.prestabanco.executive.models.ExecutiveLoginResponse;
import com.prestabanco.executive.service.ExecutiveService;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/executive")
@RefreshScope
public class ExecutiveController {

    private final ExecutiveService executiveService;
    private final JwtUtil jwtUtil;

    public ExecutiveController(ExecutiveService executiveService, JwtUtil jwtUtil) {
        this.executiveService = executiveService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Executive> get(@PathVariable long id) {
        Executive executive = executiveService.findById(id);
        return ResponseEntity.ok(executive); }

    @PostMapping("/")
    public ResponseEntity<Executive> save(@RequestBody Executive executive) {
        Executive executiveNew = executiveService.save(executive);
        return ResponseEntity.ok(executiveNew); }

    @PutMapping("/")
    public ResponseEntity<Executive> update(@RequestBody Executive executive) {
        Executive executiveNew = executiveService.save(executive);
        return ResponseEntity.ok(executiveNew); }

    @PostMapping("/login")
    public ResponseEntity<ExecutiveLoginResponse> loginUser(@RequestBody ExecutiveLoginRequest request) {
        if (request.getEmail() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        ExecutiveLoginResponse response = executiveService.loginExecutive(request);
        if (response == null || response.getId() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        String token = jwtUtil.generateToken(request.getEmail());
        response.setToken(token);

        return ResponseEntity.ok(response);
    }

}