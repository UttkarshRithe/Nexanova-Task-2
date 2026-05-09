package com.training.user.controller;

import com.training.user.dto.request.LoginRequestDTO;
import com.training.user.dto.request.UserRequestDTO;
import com.training.user.dto.request.UserUpdateRequestDTO;
import com.training.user.dto.response.UserResponseDTO;
import com.training.user.entity.enums.Role;
import com.training.user.exception.BadRequestException;
import com.training.user.service.UserService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(@Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.register(request));
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(userService.login(request));
    }

    // ================= GET USERS =================
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER', 'TRAINEE')")
    public ResponseEntity<List<UserResponseDTO>> getUsers(
            @RequestParam(value = "role", required = false) String role) {

        Role enumRole = null;

        if (role != null && !role.trim().isEmpty()) {
            try {
                enumRole = Role.valueOf(role.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role value: " + role);
            }
        }

        return ResponseEntity.ok(userService.getUsers(enumRole));
    }

    // ================= UPDATE USER =================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserUpdateRequestDTO request) {

        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    // ================= DELETE USER =================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable("id") Long id) {

        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ================= BULK UPLOAD =================
    @PostMapping("/bulk-upload")
    public ResponseEntity<List<UserResponseDTO>> bulkUploadStudents(
            @Valid @RequestBody List<UserRequestDTO> requests) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.bulkUploadStudents(requests));
    }
}