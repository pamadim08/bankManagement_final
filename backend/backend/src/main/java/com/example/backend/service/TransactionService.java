package com.example.backend.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.PageResponse;
import com.example.backend.exception.NotFoundException;
import com.example.backend.exception.ValidationException;
import com.example.backend.model.Account;
import com.example.backend.model.Transaction;
import com.example.backend.repository.AccountRepository;
import com.example.backend.repository.TransactionRepository;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    public TransactionService(TransactionRepository transactionRepository, AccountRepository accountRepository) {
        this.transactionRepository = transactionRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public Transaction depositMoney(String accountId, BigDecimal amount) {
        validateAmount(amount, "ฝาก");
        Account account = accountRepository.lockAccount(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ระบุ"));
        account.setBalanceAmount(account.getBalanceAmount().add(amount));
        accountRepository.save(account);
        return saveTransaction(account, "DEPOSIT", amount);
    }

    @Transactional
    public Transaction withdrawMoney(String accountId, BigDecimal amount) {
        validateAmount(amount, "ถอน");
        Account account = accountRepository.lockAccount(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ระบุ"));
        if (account.getBalanceAmount().compareTo(amount) < 0) {
            throw new ValidationException("amount", "ยอดเงินไม่พอ");
        }
        account.setBalanceAmount(account.getBalanceAmount().subtract(amount));
        accountRepository.save(account);
        return saveTransaction(account, "WITHDRAW", amount);
    }

    /** Largest amount allowed in a single deposit or withdrawal. */
    static final BigDecimal MAX_AMOUNT = new BigDecimal("100000000");

    private static void validateAmount(BigDecimal amount, String action) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("amount", "จำนวนเงิน" + action + "ต้องมากกว่า 0");
        }
        // The database stores 2 decimal places; reject anything finer instead of silently rounding it.
        if (amount.stripTrailingZeros().scale() > 2) {
            throw new ValidationException("amount", "จำนวนเงินมีทศนิยมได้ไม่เกิน 2 ตำแหน่ง");
        }
        if (amount.compareTo(MAX_AMOUNT) > 0) {
            throw new ValidationException("amount", "จำนวนเงินสูงสุดต่อรายการคือ 100,000,000 บาท");
        }
    }

    private Transaction saveTransaction(Account account, String type, BigDecimal amount) {
        Transaction transaction = new Transaction();
        transaction.setAccountId(account.getAccountId());
        transaction.setAmount(amount);
        transaction.setType(type);
        transaction.setBalanceAfter(account.getBalanceAmount());
        transaction.setTimestamp(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    public BigDecimal findBalance(String accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NotFoundException("ไม่พบบัญชีที่ระบุ"));
        return account.getBalanceAmount();
    }

    public List<Transaction> listTransactions(String accountId) {
        return transactionRepository.findByAccountIdOrderByTimestampDesc(accountId);
    }

    public PageResponse<Transaction> searchTransactions(String accountId, String type, LocalDate fromDate,
            LocalDate toDate, int page, int size) {
        if (!accountRepository.existsById(accountId)) {
            throw new NotFoundException("ไม่พบบัญชีที่ระบุ");
        }
        Specification<Transaction> spec = (root, query, cb) -> cb.equal(root.get("accountId"), accountId);
        if (type != null && !type.isBlank()) {
            String typeName = type.trim().toUpperCase();
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), typeName));
        }
        if (fromDate != null) {
            LocalDateTime start = fromDate.atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.<LocalDateTime>get("timestamp"), start));
        }
        if (toDate != null) {
            LocalDateTime end = toDate.plusDays(1).atStartOfDay();
            spec = spec.and((root, query, cb) -> cb.lessThan(root.<LocalDateTime>get("timestamp"), end));
        }
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "timestamp"));
        return PageResponse.fromPage(transactionRepository.findAll(spec, pageable));
    }
}
