package com.example.backend.controller;

import com.example.backend.dto.PageResponse;
import com.example.backend.model.Transaction;
import com.example.backend.service.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(originPatterns = "http://localhost:*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping("/{accountId}/deposit")
    public ResponseEntity<Transaction> depositMoney(
            @PathVariable String accountId,
            @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(transactionService.depositMoney(accountId, body.get("amount")));
    }

    @PostMapping("/{accountId}/withdraw")
    public ResponseEntity<Transaction> withdrawMoney(
            @PathVariable String accountId,
            @RequestBody Map<String, BigDecimal> body) {
        return ResponseEntity.ok(transactionService.withdrawMoney(accountId, body.get("amount")));
    }

    @GetMapping("/{accountId}/balance")
    public ResponseEntity<Map<String, BigDecimal>> findBalance(@PathVariable String accountId) {
        BigDecimal balance = transactionService.findBalance(accountId);
        return ResponseEntity.ok(Collections.singletonMap("balanceAmount", balance));
    }

    @GetMapping("/{accountId}/transactions")
    public ResponseEntity<PageResponse<Transaction>> searchTransactions(
            @PathVariable String accountId,
            @RequestParam(required = false) String type,
            @RequestParam(name = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(name = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(
                transactionService.searchTransactions(accountId, type, fromDate, toDate, page, size));
    }

    @GetMapping("/{accountId}/history")
    public ResponseEntity<List<Transaction>> listTransactions(@PathVariable String accountId) {
        return ResponseEntity.ok(transactionService.listTransactions(accountId));
    }
}
