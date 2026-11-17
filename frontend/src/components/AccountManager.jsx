import { useState, useEffect } from 'react';
import { findAccount, createAccount, updateAccount, readError, readFieldErrors } from '../services/api';

const blankForm = {
  name: '',
  email: '',
  phone: '',
};

export default function AccountManager({ accountId, selectAccount, showToast }) {
  const [searchId, setSearchId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState(blankForm);

  const clearForm = () => setForm(blankForm);

  useEffect(() => {
    if (accountId && (!account || account.accountId !== accountId)) {
      setSearchId(accountId);
    }
  }, [accountId, account]);

  const searchAccount = async (e) => {
    e.preventDefault();
    const id = searchId.trim();
    if (!id) {
      showToast('error', 'กรอกเลขที่บัญชี', 'กรุณาใส่เลขที่บัญชีก่อนค้นหา');
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const res = await findAccount(id);
      if (!res.data) {
        throw new Error('ไม่พบบัญชีนี้');
      }
      setAccount(res.data);
      setForm({
        name: res.data.name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
      });
      setIsCreating(false);
      setIsEditing(false);
      showToast('success', 'พบบัญชี', `บัญชีของ ${res.data.name}`);
      selectAccount(res.data.accountId, res.data);
    } catch (err) {
      setAccount(null);
      setIsEditing(false);
      clearForm();
      selectAccount('', null);
      const message = readError(err, 'ไม่พบบัญชีนี้ ตรวจสอบเลขที่บัญชีอีกครั้ง');
      showToast('error', 'ค้นหาไม่สำเร็จ', message);
    } finally {
      setLoading(false);
    }
  };

  const openCreateMode = () => {
    setIsCreating(true);
    setIsEditing(false);
    setAccount(null);
    setSearchId('');
    setErrors({});
    clearForm();
    selectAccount('', null);
    showToast('info', 'เปิดบัญชีใหม่', 'กรอกข้อมูลแล้วกดเปิดบัญชี');
  };

  const openSearchMode = () => {
    setIsCreating(false);
    setIsEditing(false);
    setAccount(null);
    setSearchId('');
    setErrors({});
    clearForm();
    selectAccount('', null);
  };

  const startEdit = () => {
    if (!account) return;
    setForm({
      name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
    });
    setErrors({});
    setIsEditing(true);
  };

  const cancelEdit = () => {
    if (account) {
      setForm({
        name: account.name || '',
        email: account.email || '',
        phone: account.phone || '',
      });
    } else {
      clearForm();
    }
    setErrors({});
    setIsEditing(false);
  };

  const registerAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const res = await createAccount(form);
      showToast('success', 'เปิดบัญชีสำเร็จ', `เลขที่บัญชี: ${res.data.accountId}`);
      setSearchId(res.data.accountId);
      setAccount(res.data);
      setIsCreating(false);
      setIsEditing(false);
      setErrors({});
      selectAccount(res.data.accountId, res.data);
    } catch (err) {
      const errors = readFieldErrors(err);
      setErrors(errors);
      showToast('error', 'เปิดบัญชีไม่สำเร็จ', readError(err, 'เปิดบัญชีไม่ได้'));
    } finally {
      setLoading(false);
    }
  };

  const saveAccount = async (e) => {
    e.preventDefault();
    const id = account?.accountId || searchId.trim();

    setLoading(true);
    setErrors({});
    try {
      const res = await updateAccount(id, form);
      setAccount(res.data);
      setIsEditing(false);
      setErrors({});
      showToast('success', 'บันทึกสำเร็จ', `บันทึกข้อมูลของ ${res.data.name} แล้ว`);
      selectAccount(id, res.data);
    } catch (err) {
      const errors = readFieldErrors(err);
      setErrors(errors);
      showToast('error', 'บันทึกไม่สำเร็จ', readError(err, 'บันทึกข้อมูลไม่ได้'));
    } finally {
      setLoading(false);
    }
  };

  const copyAccountId = () => {
    const id = account?.accountId || searchId;
    if (!id) return;
    if (!navigator.clipboard) {
      showToast('error', 'คัดลอกไม่สำเร็จ', 'เบราว์เซอร์นี้ไม่รองรับการคัดลอก');
      return;
    }
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopied(true);
        showToast('info', 'คัดลอกแล้ว', 'คัดลอกเลขที่บัญชีแล้ว');
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => showToast('error', 'คัดลอกไม่สำเร็จ', 'เบราว์เซอร์ไม่อนุญาตให้คัดลอก'));
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
      <div className="account-card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="account-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>
              {isCreating ? 'เปิดบัญชีใหม่' : 'จัดการบัญชี'}
            </h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', marginLeft: '40px' }}>
            {isCreating
              ? 'กรอกชื่อ อีเมล และเบอร์โทร'
              : 'ใส่เลขที่บัญชีเพื่อดูยอดและแก้ไขข้อมูล'}
          </p>
        </div>

        <button
          type="button"
          onClick={isCreating ? openSearchMode : openCreateMode}
          className={isCreating ? 'btn btn-secondary' : 'btn btn-primary'}
          style={{ fontSize: '0.875rem' }}
        >
          {isCreating ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              ค้นหาบัญชี
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              เปิดบัญชีใหม่
            </>
          )}
        </button>
      </div>

      {!isCreating && (
        <div style={{ marginBottom: account ? '24px' : '0' }}>
          <form onSubmit={searchAccount} style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                placeholder="เลขที่บัญชี"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{ paddingLeft: '40px' }}
              />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '100px' }}
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </form>
        </div>
      )}

      {isCreating && (
        <form onSubmit={registerAccount} className="account-create-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--deposit-text)' }}>
              ข้อมูลบัญชีใหม่
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              ตรวจสอบข้อมูลก่อนยืนยัน
            </span>
          </div>

          <AccountFields
            form={form}
            setForm={setForm}
            errors={errors}
            setErrors={setErrors}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={openSearchMode}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-deposit"
              disabled={loading}
              style={{ minWidth: '150px' }}
            >
              {loading ? 'กำลังบันทึก...' : 'เปิดบัญชี'}
            </button>
          </div>
        </form>
      )}

      {!isCreating && account && (
        <div
          style={{
            background: isEditing ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
            border: `1.5px solid ${isEditing ? 'var(--primary-500)' : 'var(--border-subtle)'}`,
            borderRadius: '14px',
            padding: '20px',
            transition: 'all 0.2s ease',
            marginTop: '16px',
            boxShadow: isEditing ? '0 4px 14px rgba(59, 130, 246, 0.08)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                ข้อมูลบัญชี
              </span>
              <button
                type="button"
                onClick={copyAccountId}
                style={{
                  background: 'var(--border-subtle)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500,
                }}
                title="คลิกเพื่อคัดลอกเลขที่บัญชี"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                {copied ? 'คัดลอกแล้ว' : `เลขที่: ${account.accountId.substring(0, 10)}...`}
              </button>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={startEdit}
                className="btn btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8125rem',
                  color: 'var(--primary-600)',
                  borderColor: 'var(--primary-100)',
                  backgroundColor: 'var(--primary-50)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                แก้ไขข้อมูล
              </button>
            )}
          </div>

          {!isEditing ? (
            <div className="account-info-box">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                  ชื่อ-นามสกุล
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {account.name || '-'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                  อีเมล
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {account.email || '-'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '2px' }}>
                  เบอร์โทร
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {account.phone || '-'}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveAccount}>
              <AccountFields
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
                autoFocusName
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ minWidth: '150px' }}
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function AccountFields({ form, setForm, errors, setErrors, autoFocusName }) {
  return (
    <div className="account-form-grid">
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">ชื่อ-นามสกุล</label>
        <input
          type="text"
          className="form-input"
          placeholder="ระบุชื่อ-นามสกุล"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          style={{
            borderColor: errors.name ? 'var(--withdraw-solid)' : undefined,
            backgroundColor: errors.name ? 'var(--withdraw-bg)' : undefined,
          }}
          autoFocus={autoFocusName}
        />
        {errors.name && (
          <span className="field-error-msg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {errors.name}
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">อีเมล</label>
        <input
          type="text"
          className="form-input"
          placeholder="เช่น user@example.com"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          style={{
            borderColor: errors.email ? 'var(--withdraw-solid)' : undefined,
            backgroundColor: errors.email ? 'var(--withdraw-bg)' : undefined,
          }}
        />
        {errors.email && (
          <span className="field-error-msg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {errors.email}
          </span>
        )}
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">เบอร์โทร</label>
        <input
          type="text"
          className="form-input"
          placeholder="เบอร์โทร 9-10 หลัก"
          value={form.phone}
          onChange={(e) => {
            setForm({ ...form, phone: e.target.value });
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
          }}
          style={{
            borderColor: errors.phone ? 'var(--withdraw-solid)' : undefined,
            backgroundColor: errors.phone ? 'var(--withdraw-bg)' : undefined,
          }}
        />
        {errors.phone && (
          <span className="field-error-msg">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {errors.phone}
          </span>
        )}
      </div>
    </div>
  );
}
