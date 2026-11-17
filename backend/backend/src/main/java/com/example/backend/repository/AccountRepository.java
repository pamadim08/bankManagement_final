package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import com.example.backend.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndAccountIdNot(String email, String accountId);

    @Query("SELECT a FROM Account a WHERE LOWER(a.accountId) LIKE LOWER(CONCAT('%', :keyword, '%')) "
            + "OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Account> searchAccounts(@Param("keyword") String keyword, Pageable pageable);

    @Query(value = "SELECT * FROM accounts WHERE account_id = :accountId FOR UPDATE", nativeQuery = true)
    Optional<Account> lockAccount(@Param("accountId") String accountId);
}
