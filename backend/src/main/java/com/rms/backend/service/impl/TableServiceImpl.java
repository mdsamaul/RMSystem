package com.rms.backend.service.impl;
import com.rms.backend.dto.request.TableRequest;
import com.rms.backend.dto.response.TableResponse;
import com.rms.backend.entity.RestaurantTable;
import com.rms.backend.exception.BadRequestException;
import com.rms.backend.exception.ResourceNotFoundException;
import com.rms.backend.repository.RestaurantTableRepository;
import com.rms.backend.service.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service @RequiredArgsConstructor @Transactional
public class TableServiceImpl implements TableService {
    private final RestaurantTableRepository tableRepo;

    @Override public TableResponse createTable(TableRequest req) {
        if (tableRepo.existsByTableNumber(req.getTableNumber()))
            throw new BadRequestException("Table number already exists: " + req.getTableNumber());
        RestaurantTable table = RestaurantTable.builder().tableNumber(req.getTableNumber())
            .capacity(req.getCapacity()).section(req.getSection()).build();
        return TableResponse.from(tableRepo.save(table));
    }

    @Override public TableResponse updateTable(Long id, TableRequest req) {
        RestaurantTable t = tableRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + id));
        t.setTableNumber(req.getTableNumber()); t.setCapacity(req.getCapacity());
        t.setSection(req.getSection());
        return TableResponse.from(tableRepo.save(t));
    }

    @Override public TableResponse updateStatus(Long id, RestaurantTable.TableStatus status) {
        RestaurantTable t = tableRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + id));
        t.setStatus(status);
        return TableResponse.from(tableRepo.save(t));
    }

    @Override @Transactional(readOnly=true)
    public List<TableResponse> getAllTables() {
        return tableRepo.findAll().stream().map(TableResponse::from).collect(Collectors.toList()); }

    @Override @Transactional(readOnly=true)
    public List<TableResponse> getAvailableTables() {
        return tableRepo.findByStatus(RestaurantTable.TableStatus.AVAILABLE)
            .stream().map(TableResponse::from).collect(Collectors.toList()); }

    @Override @Transactional(readOnly=true)
    public TableResponse getTableById(Long id) {
        return TableResponse.from(tableRepo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Table not found: " + id))); }

    @Override public void deleteTable(Long id) {
        if (!tableRepo.existsById(id)) throw new ResourceNotFoundException("Table not found: " + id);
        tableRepo.deleteById(id);
    }
}
