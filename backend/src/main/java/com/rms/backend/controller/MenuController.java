package com.rms.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.rms.backend.dto.request.MenuCategoryRequest;
import com.rms.backend.dto.request.MenuItemRequest;
import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.dto.response.MenuCategoryResponse;
import com.rms.backend.dto.response.MenuItemResponse;
import com.rms.backend.service.MenuService;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
@Tag(name="Menu", description="Menu categories and items management")
public class MenuController {
    private final MenuService menuService;

    // ── Categories ────────────────────────────────────────────────────────────
    @GetMapping("/categories")
    @Operation(summary="Get all active categories (public)")
    public ResponseEntity<ApiResponse<List<MenuCategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success("Categories fetched", menuService.getAllCategories()));
    }

    @PostMapping("/categories")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Create a new category (Admin only)")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> createCategory(@Valid @RequestBody MenuCategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Category created", menuService.createCategory(req)));
    }

    @PutMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Update a category (Admin only)")
    public ResponseEntity<ApiResponse<MenuCategoryResponse>> updateCategory(@PathVariable Long id, @Valid @RequestBody MenuCategoryRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Category updated", menuService.updateCategory(id, req)));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Delete a category (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        menuService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted"));
    }

    // ── Items ─────────────────────────────────────────────────────────────────
    @GetMapping("/items")
    @Operation(summary="Get all available menu items (public)")
    public ResponseEntity<ApiResponse<List<MenuItemResponse>>> getAllItems(
            @RequestParam(required=false) Long categoryId,
            @RequestParam(required=false) String search) {
        List<MenuItemResponse> items;
        if (search != null && !search.isBlank()) items = menuService.searchItems(search);
        else if (categoryId != null) items = menuService.getItemsByCategory(categoryId);
        else items = menuService.getAllItems();
        return ResponseEntity.ok(ApiResponse.success("Items fetched", items));
    }

    @GetMapping("/items/{id}")
    @Operation(summary="Get a single menu item (public)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Item fetched", menuService.getItemById(id)));
    }

    @PostMapping("/items")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Create a new menu item (Admin only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> createItem(@Valid @RequestBody MenuItemRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item created", menuService.createItem(req)));
    }

    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Update a menu item (Admin only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> updateItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Item updated", menuService.updateItem(id, req)));
    }

    @PatchMapping("/items/{id}/availability")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Toggle item availability (Admin only)")
    public ResponseEntity<ApiResponse<MenuItemResponse>> toggleAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Availability toggled", menuService.toggleAvailability(id)));
    }

    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name="bearerAuth")
    @Operation(summary="Delete a menu item (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable Long id) {
        menuService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Item deleted"));
    }
}