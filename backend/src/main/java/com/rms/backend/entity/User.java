package com.rms.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity @Table(name = "users")
@Getter  @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User implements UserDetails {
 
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false,length=100) private String fullName;
    @Column(nullable=false,unique=true,length=150) private String email;
    @Column(nullable=false) private String password;
    @Column(length=20) private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable=false) private Role role;
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_permissions", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false, length = 50, columnDefinition = "varchar(50)")
    @Builder.Default private Set<Permission> permissions = new HashSet<>();
    @Builder.Default private Boolean isActive = true;
    @Column(updatable=false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate(){ createdAt=LocalDateTime.now(); }
    @PreUpdate  protected void onUpdate(){ updatedAt=LocalDateTime.now(); }
    @Override public Collection<? extends GrantedAuthority> getAuthorities(){
        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_"+role.name()));
        if (role == Role.ADMIN) {
            for (Permission permission : Permission.values()) {
                authorities.add(new SimpleGrantedAuthority(permission.name()));
            }
        } else if (permissions != null) {
            permissions.forEach(permission -> authorities.add(new SimpleGrantedAuthority(permission.name())));
        }
        return authorities;
    }
    @Override public String getUsername(){ return email; }
    @Override public boolean isAccountNonExpired(){ return true; }
    @Override public boolean isAccountNonLocked(){ return isActive; }
    @Override public boolean isCredentialsNonExpired(){ return true; }
    @Override public boolean isEnabled(){ return isActive; }
    public enum Role { ADMIN, STAFF, CUSTOMER }
    public enum Permission {
        MENU_CREATE,
        MENU_UPDATE,
        MENU_DELETE,
        MENU_AVAILABILITY,
        TABLE_CREATE,
        TABLE_UPDATE,
        TABLE_STATUS,
        TABLE_DELETE
    }
}
