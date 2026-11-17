package com.example.backend.controller;

import com.example.backend.dto.PageResponse;
import com.example.backend.model.Account;
import com.example.backend.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(originPatterns = "http://localhost:*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        Account created = accountService.createAccount(account);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Account>> listAccounts() {
        return ResponseEntity.ok(accountService.listAccounts());
    }

    @GetMapping("/search")
    public ResponseEntity<PageResponse<Account>> searchAccounts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ResponseEntity.ok(accountService.searchAccounts(keyword, page, size));
    }

    @GetMapping("/{accountId}")
    public ResponseEntity<Account> findAccount(@PathVariable String accountId) {
        return ResponseEntity.ok(accountService.findAccount(accountId));
    }

    @PutMapping("/{accountId}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable String accountId,
            @RequestBody Account account) {
        return ResponseEntity.ok(accountService.updateAccount(accountId, account));
    }

    @DeleteMapping("/{accountId}")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable String accountId) {
        accountService.deleteAccount(accountId);
        return ResponseEntity.ok(Collections.singletonMap("message", "ลบบัญชีสำเร็จเรียบร้อย"));
    }
}
