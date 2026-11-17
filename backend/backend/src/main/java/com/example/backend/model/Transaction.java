package com.example.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions", indexes = @Index(name = "idx_tx_account_ts", columnList = "account_id, timestamp"))
public class Transaction {
    @Id
    @Column(name = "transaction_id", nullable = false, unique = true, updatable = false)
    private String transactionId = UUID.randomUUID().toString();
    @Column(name = "account_id", nullable = false)
    private String accountId;
    @Column(name = "type", nullable = false)
    private String type;
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    @Column(name = "balance_after", nullable = false)
    private BigDecimal balanceAfter;
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public Transaction() {
    }

    public Transaction(String transactionId, String accountId, String type, BigDecimal amount, BigDecimal balanceAfter,
            LocalDateTime timestamp) {
        this.transactionId = transactionId;
        this.accountId = accountId;
        this.type = type;
        this.amount = amount;
        this.balanceAfter = balanceAfter;
        this.timestamp = timestamp;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getBalanceAfter() {
        return balanceAfter;
    }

    public void setBalanceAfter(BigDecimal balanceAfter) {
        this.balanceAfter = balanceAfter;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

}
