package com.rms.backend.controller;

import com.rms.backend.dto.response.ApiResponse;
import com.rms.backend.entity.RestaurantTable;
import com.rms.backend.repository.OrderRepository;
import com.rms.backend.repository.RestaurantTableRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reports", description = "Analytics and reporting")
public class ReportController {
    private final OrderRepository orderRepo;
    private final RestaurantTableRepository tableRepo;

    @GetMapping("/revenue")
    @Operation(summary = "Get revenue report for a date range")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Double revenue = orderRepo.getTotalRevenueBetween(start, end);
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("from", start);
        report.put("to", end);
        report.put("totalRevenue", revenue != null ? revenue : 0.0);
        return ResponseEntity.ok(ApiResponse.success("Revenue report", report));
    }

    @GetMapping("/top-items")
    @Operation(summary = "Get top-selling menu items")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopItems() {
        List<Object[]> raw = orderRepo.findTopSellingItems();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : raw) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("itemName", row[0]);
            item.put("totalSold", row[1]);
            result.add(item);
        }

        return ResponseEntity.ok(ApiResponse.success("Top items", result));
    }

    @GetMapping("/table-occupancy")
    @Operation(summary = "Get table occupancy summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOccupancy() {
        long total = tableRepo.count();
        long available = tableRepo.findByStatus(RestaurantTable.TableStatus.AVAILABLE).size();
        long occupied = tableRepo.findByStatus(RestaurantTable.TableStatus.OCCUPIED).size();
        long reserved = tableRepo.findByStatus(RestaurantTable.TableStatus.RESERVED).size();

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("total", total);
        report.put("available", available);
        report.put("occupied", occupied);
        report.put("reserved", reserved);
        report.put("occupancyRate", total > 0 ? String.format("%.1f%%", (double) occupied / total * 100) : "0%");

        return ResponseEntity.ok(ApiResponse.success("Table occupancy", report));
    }
}
