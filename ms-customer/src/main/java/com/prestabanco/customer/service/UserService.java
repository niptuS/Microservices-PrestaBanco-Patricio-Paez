package com.prestabanco.customer.service;

import com.prestabanco.customer.entity.User;
import com.prestabanco.customer.models.*;
import com.prestabanco.customer.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserResponse registerUser(UserRequest request) {
        if (userRepository.findFirstByEmail(request.getEmail()) != null) {
            return new UserResponse(2, "Email already registered");
        }
        User user = new User();
        user.setName(request.getName());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setAge(request.getAge());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setLatePayments(false);
        user.setAmountOfLatePayments(0);
        user.setMinCashOnAccount(false);
        user.setConsistentSaveHistory(false);
        user.setPeriodicDeposits(false);
        user.setRelationYearsAndBalance(false);
        user.setRecentWithdraws(false);
        user.setWorking(false);
        user.setWorkingYears(0);
        user.setIndependentWorker(false);
        User savedUser = userRepository.save(user);
        if (savedUser.getId() == null) {
            return new UserResponse(3, "Error registering user");
        }
        return new UserResponse(1, "User registered successfully");
    }

    public UserLoginResponse loginUser(UserLoginRequest request) {
        User user = userRepository.findFirstByEmail(request.getEmail());

        if (user == null) {
            return new UserLoginResponse(null, null);
        }

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new UserLoginResponse(user.getId(), null);
        }

        return new UserLoginResponse(null, null);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}