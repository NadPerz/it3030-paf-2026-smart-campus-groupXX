package com.smartcampus.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security Configuration — Shared / Member 4 responsibility.
 *
 * TODO (Member 4): Replace permitAll with proper role-based access control once
 *   OAuth2 login is integrated. Add .oauth2Login() to enable Google Sign-In.
 *   Secure admin endpoints with .hasRole("ADMIN") checks.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF — using stateless JWT / session cookies via OAuth
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // TODO (Member 4): Tighten these rules once OAuth2 is integrated.
                //   Example:
                //   .requestMatchers("/api/admin/**").hasRole("ADMIN")
                //   .requestMatchers("/api/auth/**").permitAll()
                //   .anyRequest().authenticated()
                .requestMatchers("/api/**").permitAll()
                .anyRequest().authenticated()
            );
            // TODO (Member 4): Uncomment to enable Google OAuth2 login:
            // .oauth2Login(oauth2 -> oauth2
            //     .defaultSuccessUrl("/api/auth/me", true)
            //     .failureUrl("/login?error=true")
            // );

        return http.build();
    }
}
