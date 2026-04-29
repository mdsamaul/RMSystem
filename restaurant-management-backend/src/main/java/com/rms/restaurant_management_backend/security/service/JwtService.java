package com.rms.restaurant_management_backend.security.service;
import com.rms.restaurant_management_backend.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.security.Key;
import java.util.*;
import java.util.function.Function;



@Service
public class JwtService {
    @Value("${app.jwt.secret}") private String secretKey;
    @Value("${app.jwt.expiration}") private long jwtExpiration;
    @Value("${app.jwt.refresh-expiration}") private long refreshExpiration;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject); }

    public <T> T extractClaim(String token, Function<Claims,T> resolver) {
        return resolver.apply(extractAllClaims(token)); }

    public String generateToken(UserDetails userDetails) {
        Map<String,Object> claims = new HashMap<>();
        if (userDetails instanceof User u) {
            claims.put("role", u.getRole().name());
            claims.put("fullName", u.getFullName());
        }
        return buildToken(claims, userDetails, jwtExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration); }

    private String buildToken(Map<String,Object> claims, UserDetails ud, long expiry) {
        return Jwts.builder().setClaims(claims).setSubject(ud.getUsername())
            .setIssuedAt(new Date(System.currentTimeMillis()))
            .setExpiration(new Date(System.currentTimeMillis()+expiry))
            .signWith(getSignInKey(), SignatureAlgorithm.HS256).compact();
    }

    public boolean isTokenValid(String token, UserDetails ud) {
        return extractUsername(token).equals(ud.getUsername()) && !isTokenExpired(token); }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date()); }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSignInKey())
            .build().parseClaimsJws(token).getBody(); }

    private Key getSignInKey() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey)); }
}