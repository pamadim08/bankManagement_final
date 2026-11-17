package com.example.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.backend.dto.PageResponse;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.Account;
import com.example.backend.repository.AccountRepository;

import jakarta.transaction.Transactional;

@Service
public class AccountService {
    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    private void checkAccount(Account account, String ownId) {
        if (account.getName() == null || account.getName().trim().isEmpty()) {
            throw new ValidationException("name", "กรุณากรอกชื่อ-นามสกุล");
        }
        if (account.getName().trim().length() > 100) {
            throw new ValidationException("name", "ชื่อ-นามสกุลต้องมีความยาวไม่เกิน 100 ตัวอักษร");
        }

        if (account.getEmail() == null || account.getEmail().trim().isEmpty()) {
            throw new ValidationException("email", "กรุณากรอกอีเมล");
        }
        if (account.getEmail().trim().length() > 100) {
            throw new ValidationException("email", "อีเมลต้องมีความยาวไม่เกิน 100 ตัวอักษร");
        }
        if (!account.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ValidationException("email", "รูปแบบอีเมลไม่ถูกต้อง");
        }

        String email = account.getEmail().trim();
        if (ownId == null) {
            if (accountRepository.existsByEmail(email)) {
                throw new ValidationException("email", "อีเมลนี้มีอยู่ในระบบแล้ว");
            }
        } else {
            if (accountRepository.existsByEmailAndAccountIdNot(email, ownId)) {
                throw new ValidationException("email", "อีเมลนี้มีอยู่ในระบบแล้ว");
            }
        }

        if (account.getPhone() == null || account.getPhone().trim().isEmpty()) {
            throw new ValidationException("phone", "กรุณากรอกเบอร์โทรศัพท์");
        }
        if (!account.getPhone().matches("^[0-9]{9,10}$")) {
            throw new ValidationException("phone", "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9 หรือ 10 หลักเท่านั้น");
        }
    }

    public Account findAccount(String accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ระบุ"));
    }

    public List<Account> listAccounts() {
        return accountRepository.findAll();
    }

    public PageResponse<Account> searchAccounts(String keyword, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        if (keyword == null || keyword.isBlank()) {
            return PageResponse.fromPage(accountRepository.findAll(pageable));
        }
        String k = keyword.trim();
        return PageResponse.fromPage(
                accountRepository.searchAccounts(k, pageable));
    }

    public Account createAccount(Account account) {
        checkAccount(account, null);
        account.setAccountId(UUID.randomUUID().toString());
        account.setBalanceAmount(BigDecimal.ZERO);
        account.setCreatedAt(LocalDateTime.now());
        try {
            return accountRepository.save(account);
        } catch (DataIntegrityViolationException e) {
            // Two requests with the same email can both pass the existsByEmail check; the unique index decides.
            throw new ValidationException("email", "อีเมลนี้มีอยู่ในระบบแล้ว");
        }
    }

    @Transactional
    public Account updateAccount(String accountId, Account account) {
        checkAccount(account, accountId);
        Account oldAccount = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ต้องการแก้ไข"));

        oldAccount.setName(account.getName());
        oldAccount.setEmail(account.getEmail());
        oldAccount.setPhone(account.getPhone());

        try {
            return accountRepository.saveAndFlush(oldAccount);
        } catch (DataIntegrityViolationException e) {
            throw new ValidationException("email", "อีเมลนี้มีอยู่ในระบบแล้ว");
        }
    }

    @Transactional
    public void deleteAccount(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ต้องการลบ"));
        if (account.getBalanceAmount() != null && account.getBalanceAmount().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("ไม่สามารถลบบัญชีที่มีเงินคงเหลือในบัญชีได้");
        }
        accountRepository.deleteById(accountId);
    }
}
