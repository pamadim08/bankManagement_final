import { formatDate, formatMoney } from '../services/format';

export default function TransactionHistory({ transactions = [], total = transactions.length }) {
  return (
    <div className="card animate-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </span>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
            ประวัติธุรกรรม
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-surface-subtle)',
            padding: '4px 12px',
            borderRadius: '9999px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {total > transactions.length
            ? `แสดงล่าสุด ${transactions.length} จาก ${total.toLocaleString()} รายการ`
            : `ทั้งหมด ${transactions.length} รายการ`}
        </span>
      </div>

      {transactions.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: '12px',
            border: '1.5px dashed var(--border-subtle)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--border-subtle)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '4px' }}>
            ยังไม่มีธุรกรรม
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ฝากหรือถอนเงินแล้ว รายการจะแสดงที่นี่
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="history-table">
            <thead>
              <tr>
                <th>ประเภท</th>
                <th className="th-right">จำนวนเงิน</th>
                <th className="th-right">ยอดคงเหลือ</th>
                <th>วันเวลา</th>
                <th>รหัสธุรกรรม</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, idx) => {
                const isDeposit = tx.type === 'DEPOSIT';
                return (
                  <tr key={tx.transactionId || tx.id || idx}>
                    <td>
                      <span className={isDeposit ? 'badge badge-deposit' : 'badge badge-withdraw'}>
                        {isDeposit ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                            ฝากเงิน
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            ถอนเงิน
                          </>
                        )}
                      </span>
                    </td>
                    <td
                      className="td-right"
                      style={{
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        color: isDeposit ? 'var(--deposit-text)' : 'var(--withdraw-text)',
                      }}
                    >
                      {isDeposit ? '+' : '-'} {formatMoney(tx.amount)}
                    </td>
                    <td
                      className="td-right"
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-main)',
                      }}
                    >
                      {formatMoney(tx.balanceAfter)}
                    </td>
                    <td
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {formatDate(tx.timestamp)}
                    </td>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {tx.transactionId ? `${tx.transactionId.substring(0, 8)}...` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}