package com.rms.restaurant_management_backend.config;
import com.rms.restaurant_management_backend.entity.User;
import com.rms.restaurant_management_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor @Slf4j
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override public void run(String... args) {
        if (!userRepository.existsByEmail("admin@rms.com")) {
            userRepository.save(User.builder().fullName("System Admin").email("admin@rms.com")
                .password(passwordEncoder.encode("admin123")).phone("01700000000")
                .role(User.Role.ADMIN).isActive(true).build());
            log.info("✅ Admin created  →  admin@rms.com / admin123");
        }
        if (!userRepository.existsByEmail("staff@rms.com")) {
            userRepository.save(User.builder().fullName("Demo Staff").email("staff@rms.com")
                .password(passwordEncoder.encode("staff123")).phone("01711111111")
                .role(User.Role.STAFF).isActive(true).build());
            log.info("✅ Staff created  →  staff@rms.com / staff123");
        }
    }
}
