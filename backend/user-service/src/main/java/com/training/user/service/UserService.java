package com.training.user.service;

import com.training.user.dto.request.LoginRequestDTO;
import com.training.user.dto.request.UserRequestDTO;
import com.training.user.dto.request.UserUpdateRequestDTO;
import com.training.user.dto.response.UserResponseDTO;
import com.training.user.entity.enums.Role;
import java.util.List;

public interface UserService {

    UserResponseDTO register(UserRequestDTO request);

    String login(LoginRequestDTO request);

    List<UserResponseDTO> getUsers(Role role);

    UserResponseDTO updateUser(Long id, UserUpdateRequestDTO request);

    void deleteUser(Long id);

    List<UserResponseDTO> bulkUploadStudents(List<UserRequestDTO> requests);
}
