package com.rms.backend.controller;
import com.rms.backend.dto.request.TableRequest;
import com.rms.backend.dto.response.*;
import com.rms.backend.entity.RestaurantTable;
import com.rms.backend.service.TableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
@SecurityRequirement(name="bearerAuth")
@Tag(name="Tables", description="Restaurant table management")
public class TableController {
    private final TableService tableService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Get all tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAllTables() {
        return ResponseEntity.ok(ApiResponse.success("Tables fetched", tableService.getAllTables()));
    }

    @GetMapping("/available")
    @Operation(summary="Get available tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> getAvailableTables() {
        return ResponseEntity.ok(ApiResponse.success("Available tables", tableService.getAvailableTables()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    @Operation(summary="Get table by ID")
    public ResponseEntity<ApiResponse<TableResponse>> getTable(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Table fetched", tableService.getTableById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('TABLE_CREATE')")
    @Operation(summary="Add a new table")
    public ResponseEntity<ApiResponse<TableResponse>> createTable(@Valid @RequestBody TableRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Table created", tableService.createTable(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('TABLE_UPDATE')")
    @Operation(summary="Update a table")
    public ResponseEntity<ApiResponse<TableResponse>> updateTable(@PathVariable Long id, @Valid @RequestBody TableRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Table updated", tableService.updateTable(id, req)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('TABLE_STATUS')")
    @Operation(summary="Update table status")
    public ResponseEntity<ApiResponse<TableResponse>> updateStatus(@PathVariable Long id, @RequestParam RestaurantTable.TableStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated", tableService.updateStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('TABLE_DELETE')")
    @Operation(summary="Delete a table")
    public ResponseEntity<ApiResponse<Void>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(ApiResponse.success("Table deleted"));
    }
}
