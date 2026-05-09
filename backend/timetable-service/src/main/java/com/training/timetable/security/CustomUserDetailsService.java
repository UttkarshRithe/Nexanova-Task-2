package com.training.timetable.security;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            String sql = "SELECT password, role FROM users WHERE email = ?";
            var row = jdbcTemplate.queryForMap(sql, email);

            String password = (String) row.get("password");
            String role = (String) row.get("role");

            List<SimpleGrantedAuthority> authorities = role == null
                    ? List.of()
                    : List.of(new SimpleGrantedAuthority("ROLE_" + role));

            return org.springframework.security.core.userdetails.User.builder()
                    .username(email)
                    .password(password)
                    .authorities(authorities)
                    .build();
        } catch (EmptyResultDataAccessException ex) {
            throw new UsernameNotFoundException("User not found for email: " + email);
        }
    }
}

