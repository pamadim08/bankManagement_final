package com.example.backend.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "accounts")
public class Account {
    @Id
    @Column(name = "account_id", nullable = false, unique = true)
    private String accountId;
    @Column(name = "name", nullable = false)
    private String name;
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "phone", nullable = false)
    private String phone;
    @Column(name = "balance_amount")
    private BigDecimal balanceAmount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Account() {
    }

    public Account(String accountId, String name, String email, String phone, BigDecimal balanceAmount,
            LocalDateTime createdAt) {
        this.accountId = accountId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.balanceAmount = balanceAmount;
        this.createdAt = createdAt;
    }

    public String getAccountId() {
        return accountId;
    }

    public void setAccountId(String accountId) {
        this.accountId = accountId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

}
