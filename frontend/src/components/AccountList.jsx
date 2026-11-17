import { useState, useEffect, useCallback } from 'react';
import { searchAccounts, searchTransactions, readError } from '../services/api';
import { formatDate, formatMoney } from '../services/format';

const PAGE_SIZE = 100;

function Pager({ page, totalPages, totalElements, onChange }) {
  return (
    <div className="list-pager">
      <span>ทั้งหมด {totalElements.toLocaleString()} รายการ</span>
      <div className="list-pager-buttons">
        <button type="button" className="btn btn-secondary" disabled={page <= 0} onClick={() => onChange(page - 1)}>
          ‹ ก่อนหน้า
        </button>
        <span>หน้า {totalPages === 0 ? 0 : page + 1} / {totalPages}</span>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page + 1 >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          ถัดไป ›
        </button>
      </div>
    </div>
  );
}

const blankPage = { content: [], page: 0, totalPages: 0, totalElements: 0 };

export default function AccountList({ showToast }) {
  const [account, setAccount] = useState(null);

  return account ? (
    <TransactionList account={account} onBack={() => setAccount(null)} showToast={showToast} />
  ) : (
    <AccountTable onSelect={setAccount} showToast={showToast} />
  );
}

function AccountTable({ onSelect, showToast }) {
  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(blankPage);
  const [loading, setLoading] = useState(false);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchAccounts({ keyword, page, size: PAGE_SIZE });
      setPageData(res.data);
    } catch (err) {
      showToast('error', 'โหลดบัญชีไม่สำเร็จ', readError(err));
    } finally {
      setLoading(false);
    }
  }, [keyword, page, showToast]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setKeyword(searchText.trim());
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>รายการบัญชีทั้งหมด</h3>

      <form onSubmit={submitSearch} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="ค้นหาเลขที่บัญชีหรือชื่อ"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>ค้นหา</button>
        {keyword && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => { setSearchText(''); setKeyword(''); setPage(0); }}
          >
            ล้าง
          </button>
        )}
      </form>

      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th>เลขที่บัญชี</th>
              <th>ชื่อ-นามสกุล</th>
              <th>อีเมล</th>
              <th>เบอร์โทร</th>
              <th style={{ textAlign: 'right' }}>ยอดคงเหลือ</th>
              <th>วันที่เปิดบัญชี</th>
            </tr>
          </thead>
          <tbody>
            {pageData.content.length === 0 && (
              <tr><td colSpan={6} className="list-empty">{loading ? 'กำลังโหลด...' : 'ไม่พบข้อมูลบัญชี'}</td></tr>
            )}
            {pageData.content.map((a) => (
              <tr key={a.accountId} className="list-row" onClick={() => onSelect(a)} title="คลิกเพื่อดูธุรกรรม">
                <td className="list-mono">{a.accountId}</td>
                <td>{a.name}</td>
                <td>{a.email}</td>
                <td>{a.phone}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(a.balanceAmount)}</td>
                <td>{formatDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={pageData.page} totalPages={pageData.totalPages} totalElements={pageData.totalElements} onChange={setPage} />
    </div>
  );
}

function TransactionList({ account, onBack, showToast }) {
  const [typeInput, setTypeInput] = useState('');
  const [fromInput, setFromInput] = useState('');
  const [toInput, setToInput] = useState('');
  const [activeFilters, setActiveFilters] = useState({ type: '', dateFrom: '', dateTo: '' });
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState(blankPage);
  const [loading, setLoading] = useState(false);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchTransactions(account.accountId, { ...activeFilters, page, size: PAGE_SIZE });
      setPageData(res.data);
    } catch (err) {
      showToast('error', 'โหลดธุรกรรมไม่สำเร็จ', readError(err));
    } finally {
      setLoading(false);
    }
  }, [account.accountId, activeFilters, page, showToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const submitFilter = (e) => {
    e.preventDefault();
    setPage(0);
    setActiveFilters({ type: typeInput, dateFrom: fromInput, dateTo: toInput });
  };

  const clearFilter = () => {
    setTypeInput(''); setFromInput(''); setToInput('');
    setPage(0);
    setActiveFilters({ type: '', dateFrom: '', dateTo: '' });
  };

  return (
    <div className="card animate-fade-in" style={{ marginBottom: '24px' }}>
      <button type="button" className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '16px' }}>
        ‹ กลับ
      </button>
      <h3 style={{ fontSize: '1.2rem' }}>ธุรกรรมของ {account.name}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 16px' }}>
        เลขที่บัญชี <span className="list-mono">{account.accountId}</span> · ยอดคงเหลือ {formatMoney(account.balanceAmount)}
      </p>

      <form onSubmit={submitFilter} className="list-filters">
        <div>
          <label className="form-label">ประเภท</label>
          <select className="form-input" value={typeInput} onChange={(e) => setTypeInput(e.target.value)}>
            <option value="">ทั้งหมด</option>
            <option value="DEPOSIT">ฝาก</option>
            <option value="WITHDRAW">ถอน</option>
          </select>
        </div>
        <div>
          <label className="form-label">ตั้งแต่วันที่</label>
          <input type="date" className="form-input" value={fromInput} onChange={(e) => setFromInput(e.target.value)} />
        </div>
        <div>
          <label className="form-label">ถึงวันที่</label>
          <input type="date" className="form-input" value={toInput} onChange={(e) => setToInput(e.target.value)} />
        </div>
        <div className="list-filters-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>ค้นหา</button>
          <button type="button" className="btn btn-secondary" onClick={clearFilter}>ล้าง</button>
        </div>
      </form>

      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th>วันเวลา</th>
              <th>ประเภท</th>
              <th style={{ textAlign: 'right' }}>จำนวนเงิน</th>
              <th style={{ textAlign: 'right' }}>ยอดคงเหลือหลังรายการ</th>
              <th>รหัสธุรกรรม</th>
            </tr>
          </thead>
          <tbody>
            {pageData.content.length === 0 && (
              <tr><td colSpan={5} className="list-empty">{loading ? 'กำลังโหลด...' : 'ไม่พบธุรกรรม'}</td></tr>
            )}
            {pageData.content.map((t) => (
              <tr key={t.transactionId}>
                <td>{formatDate(t.timestamp)}</td>
                <td>
                  <span className={t.type === 'DEPOSIT' ? 'list-badge list-badge-in' : 'list-badge list-badge-out'}>
                    {t.type === 'DEPOSIT' ? 'ฝาก' : 'ถอน'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>{formatMoney(t.amount)}</td>
                <td style={{ textAlign: 'right' }}>{formatMoney(t.balanceAfter)}</td>
                <td className="list-mono">{t.transactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={pageData.page} totalPages={pageData.totalPages} totalElements={pageData.totalElements} onChange={setPage} />
    </div>
  );
}
