package com.training.user.service.impl;

import com.training.user.dto.request.LoginRequestDTO;
import com.training.user.dto.request.UserRequestDTO;
import com.training.user.dto.request.UserUpdateRequestDTO;
import com.training.user.dto.response.UserResponseDTO;
import com.training.user.entity.User;
import com.training.user.entity.enums.Role;
import com.training.user.exception.BadRequestException;
import com.training.user.exception.ResourceNotFoundException;
import com.training.user.repository.UserRepository;
import com.training.user.security.JwtUtil;
import com.training.user.service.UserService;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public UserResponseDTO register(UserRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                // Store BCrypt-encoded password (never plaintext).
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        User saved = userRepository.save(user);
        return toUserResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public String login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found for email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid credentials.");
        }

        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getUsers(Role role) {
        List<User> users = role == null
                ? userRepository.findAll()
                : userRepository.findByRole(role);

        return users.stream()
                .map(this::toUserResponseDTO)
                .toList();
    }

    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (userRepository.existsByEmailAndIdNot(request.getEmail(), id)) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());

        User updatedUser = userRepository.save(user);
        return toUserResponseDTO(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        userRepository.delete(user);
        userRepository.flush();
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> bulkUploadStudents(List<UserRequestDTO> requests) {
        List<UserResponseDTO> savedUsers = new ArrayList<>();
        Set<String> processedEmails = new HashSet<>();

        for (UserRequestDTO request : requests) {
            String email = request.getEmail();

            // Skip duplicates within the same bulk request.
            if (!processedEmails.add(email)) {
                continue;
            }

            // Skip duplicates already stored in the database.
            if (userRepository.existsByEmail(email)) {
                continue;
            }

            User user = User.builder()
                    .name(request.getName())
                    .email(email)
                    // Store BCrypt-encoded password (never plaintext).
                    .password(passwordEncoder.encode(request.getPassword()))
                    .role(Role.TRAINEE)
                    .build();

            savedUsers.add(toUserResponseDTO(userRepository.save(user)));
        }

        return savedUsers;
    }

    private UserResponseDTO toUserResponseDTO(User user) {
        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
