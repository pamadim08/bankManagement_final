import { useState } from 'react';
import { depositMoney, withdrawMoney, readError, readFieldErrors } from '../services/api';

// Must match the limit enforced by the backend (TransactionService.MAX_AMOUNT).
const MAX_AMOUNT = 100000000;

export default function TransactionForm({
  accountId,
  account,
  balance,
  onTransactionSuccess,
  showToast,
}) {
  const [activeTab, setActiveTab] = useState('DEPOSIT');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const quickAmounts = [100, 500, 1000, 5000, 10000];

  const pickPreset = (preset) => {
    setAmount(preset.toString());
    setServerErrors({});
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    setServerErrors({});
  };

  const amountNum = parseFloat(amount);
  const isPositive = !isNaN(amountNum) && amountNum > 0;
  const isOverBalance = activeTab === 'WITHDRAW' && balance !== null && amountNum > Number(balance);

  const decimalPlaces = amount.includes('.') ? amount.split('.')[1].replace(/0+$/, '').length : 0;

  let inputError = '';
  if (amount !== '') {
    if (!isPositive) {
      inputError = 'จำนวนเงินต้องมากกว่า 0';
    } else if (decimalPlaces > 2) {
      inputError = 'ใส่ทศนิยมได้ไม่เกิน 2 ตำแหน่ง';
    } else if (amountNum > MAX_AMOUNT) {
      inputError = 'จำนวนเงินสูงสุดต่อรายการคือ ฿100,000,000';
    } else if (isOverBalance) {
      inputError = 'ยอดเงินไม่พอ';
    }
  }

  const amountError = inputError || serverErrors.amount;
  const hasError = Boolean(amountError);
  const isDisabled = loading || !amount || !isPositive || isOverBalance || Boolean(inputError);

  const openConfirm = (e) => {
    e.preventDefault();
    if (!accountId) {
      showToast('error', 'ไม่พบบัญชี', 'ค้นหาบัญชีก่อนทำรายการ');
      return;
    }
    if (isDisabled) {
      if (amountError) {
        showToast('error', 'ข้อมูลไม่ถูกต้อง', amountError);
      }
      return;
    }
    setShowConfirm(true);
  };

  const submitTransaction = async () => {
    setLoading(true);
    setServerErrors({});
    const isDeposit = activeTab === 'DEPOSIT';
    try {
      if (isDeposit) {
        await depositMoney(accountId, amount);
      } else {
        await withdrawMoney(accountId, amount);
      }
      showToast(
        'success',
        isDeposit ? 'ฝากเงินสำเร็จ' : 'ถอนเงินสำเร็จ',
        `${isDeposit ? 'ฝากเงิน' : 'ถอนเงิน'} ฿${Number(amount).toLocaleString()} เรียบร้อย`
      );
      setAmount('');
      setServerErrors({});
      setShowConfirm(false);
      onTransactionSuccess();
    } catch (err) {
      setServerErrors(readFieldErrors(err));
      setShowConfirm(false);
      showToast(
        'error',
        'ทำรายการไม่สำเร็จ',
        readError(err, 'ทำรายการไม่ได้')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="tx-grid">
        <div className="balance-card animate-fade-in">
          <div className="balance-card-glow" />

          <div>
            <div className="balance-card-header">
              <div className="balance-chip">
                <div className="balance-chip-icon">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2.5"
                  >
                    <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  บัญชีเงินฝาก
                </span>
              </div>
            </div>

            <div className="balance-label">
              ยอดเงินคงเหลือ
            </div>
            <div className="balance-amount">
              {balance !== null ? (
                <>
                  ฿
                  {Number(balance).toLocaleString('th-TH', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              ) : (
                '--.--'
              )}
            </div>
          </div>

          <div className="balance-footer">
            <div>
              <div className="balance-sub-label">
                ชื่อบัญชี
              </div>
              <div className="balance-sub-value">
                {account?.name || '-'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="balance-sub-label">
                เลขที่บัญชี
              </div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--border-subtle)' }}>
                •••• {accountId ? accountId.substring(accountId.length - 8) : '0000'}
              </div>
            </div>
          </div>
        </div>

        <div className="card tx-panel animate-fade-in">
          <div>
            <h3 className="tx-panel-title">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              ฝาก / ถอนเงิน
            </h3>

            <div className="tx-tabs">
              <button
                type="button"
                onClick={() => changeTab('DEPOSIT')}
                className={`tx-tab-btn ${activeTab === 'DEPOSIT' ? 'active-deposit' : ''}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
                ฝากเงิน
              </button>

              <button
                type="button"
                onClick={() => changeTab('WITHDRAW')}
                className={`tx-tab-btn ${activeTab === 'WITHDRAW' ? 'active-withdraw' : ''}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
                ถอนเงิน
              </button>
            </div>

            <form onSubmit={openConfirm}>
              <div className="form-group">
                <label className="form-label">
                  จำนวนเงินที่{activeTab === 'DEPOSIT' ? 'ฝาก' : 'ถอน'} (บาท)
                </label>
                <div className="input-currency-wrapper">
                  <span className={`currency-prefix ${serverErrors.amount ? 'has-error' : ''}`}>
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    className={`form-input tx-amount-input ${hasError ? 'has-error' : ''}`}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (serverErrors.amount) setServerErrors((prev) => ({ ...prev, amount: '' }));
                    }}
                    required
                  />
                </div>
                {amountError && (
                  <span className="field-error-msg">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {amountError}
                  </span>
                )}
              </div>

              <div className="preset-list">
                {quickAmounts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => pickPreset(p)}
                    className={`preset-btn ${amount === p.toString() ? 'selected' : ''}`}
                  >
                    +{p.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className={activeTab === 'DEPOSIT' ? 'btn btn-deposit' : 'btn btn-withdraw'}
                disabled={isDisabled}
                style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              >
                {activeTab === 'DEPOSIT' ? 'ฝากเงิน' : 'ถอนเงิน'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-box animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div className={`modal-icon ${activeTab === 'DEPOSIT' ? 'deposit' : 'withdraw'}`}>
                {activeTab === 'DEPOSIT' ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                )}
              </div>

              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                ยืนยัน{activeTab === 'DEPOSIT' ? 'ฝากเงิน' : 'ถอนเงิน'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                ตรวจสอบรายการก่อนยืนยัน
              </p>
            </div>

            <div className="modal-details">
              <div className="modal-row">
                <span className="modal-row-label">ประเภท:</span>
                <span
                  className={activeTab === 'DEPOSIT' ? 'badge badge-deposit' : 'badge badge-withdraw'}
                  style={{ fontSize: '0.75rem' }}
                >
                  {activeTab === 'DEPOSIT' ? 'ฝากเงิน' : 'ถอนเงิน'}
                </span>
              </div>

              <div className="modal-row">
                <span className="modal-row-label">ชื่อบัญชี:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{account?.name || '-'}</span>
              </div>

              <div className="modal-row">
                <span className="modal-row-label">เลขที่บัญชี:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                  {accountId || '-'}
                </span>
              </div>

              <hr className="modal-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>จำนวนเงิน:</span>
                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: activeTab === 'DEPOSIT' ? 'var(--deposit-text)' : 'var(--withdraw-text)',
                  }}
                >
                  ฿{amount || '0.00'}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                style={{ padding: '12px' }}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                className={activeTab === 'DEPOSIT' ? 'btn btn-deposit' : 'btn btn-withdraw'}
                onClick={submitTransaction}
                disabled={isDisabled || loading}
                style={{ padding: '12px' }}
              >
                {loading ? 'กำลังทำรายการ...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}