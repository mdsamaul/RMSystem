package com.rms.backend.service;

import java.util.List;

import com.rms.backend.dto.request.MenuCategoryRequest;
import com.rms.backend.dto.request.MenuItemRequest;
import com.rms.backend.dto.response.MenuCategoryResponse;
import com.rms.backend.dto.response.MenuItemResponse;
public interface MenuService {
    MenuCategoryResponse createCategory(MenuCategoryRequest req);
    MenuCategoryResponse updateCategory(Long id, MenuCategoryRequest req);
    void deleteCategory(Long id);
    List<MenuCategoryResponse> getAllCategories();
    MenuItemResponse createItem(MenuItemRequest req);
    MenuItemResponse updateItem(Long id, MenuItemRequest req);
    void deleteItem(Long id);
    MenuItemResponse toggleAvailability(Long id);
    List<MenuItemResponse> getAllItems();
    List<MenuItemResponse> getItemsByCategory(Long categoryId);
    MenuItemResponse getItemById(Long id);
    List<MenuItemResponse> searchItems(String keyword);
}
