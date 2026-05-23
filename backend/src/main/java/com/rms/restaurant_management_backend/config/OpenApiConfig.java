package com.rms.restaurant_management_backend.config;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.enums.*;
import io.swagger.v3.oas.annotations.info.*;
import io.swagger.v3.oas.annotations.security.*;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info=@Info(title="Restaurant Management System API", version="1.0.0",
        description="Complete REST API for RMS", contact=@Contact(name="RMS Team",email="admin@rms.com")),
    servers=@Server(url="http://localhost:8081",description="Local Server"))
@SecurityScheme(name="bearerAuth",description="JWT Token",scheme="bearer",
    type=SecuritySchemeType.HTTP,bearerFormat="JWT",in=SecuritySchemeIn.HEADER)
public class OpenApiConfig {}
