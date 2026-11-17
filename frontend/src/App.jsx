import { useState, useCallback, useRef } from 'react';
import { findBalance, searchTransactions, readError } from './services/api';
import AccountManager from './components/AccountManager';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Toast from './components/Toast';
import AccountList from './components/AccountList';
import './App.css';

// Only the latest transactions are shown on the main screen; the full list is paged in "รายการบัญชีทั้งหมด".
const HISTORY_PAGE_SIZE = 50;

export default function App() {
  const [view, setView] = useState('manage');
  const [accountId, setAccountId] = useState('');
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [transactionTotal, setTransactionTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const latestLoad = useRef(0);

  const showToast = useCallback((type, title, message, duration = 4000) => {
    setToast({ type, title, message, duration });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadDetails = useCallback(async (id) => {
    if (!id) return;
    // Ignore responses that arrive after a newer request (e.g. the user switched account quickly).
    const requestId = ++latestLoad.current;
    try {
      const [balanceRes, txRes] = await Promise.all([
        findBalance(id),
        searchTransactions(id, { page: 0, size: HISTORY_PAGE_SIZE }),
      ]);
      if (requestId !== latestLoad.current) return;
      setBalance(balanceRes.data.balanceAmount);
      setTransactions(Array.isArray(txRes.data?.content) ? txRes.data.content : []);
      setTransactionTotal(txRes.data?.totalElements ?? 0);
    } catch (err) {
      if (requestId !== latestLoad.current) return;
      console.error('โหลดข้อมูลยอดเงินและประวัติธุรกรรมไม่สำเร็จ', err);
      showToast('error', 'โหลดข้อมูลบัญชีไม่สำเร็จ', readError(err));
    }
  }, [showToast]);

  const selectAccount = useCallback((id, data) => {
    if (!id) {
      latestLoad.current += 1;
      setAccountId('');
      setAccount(null);
      setBalance(null);
      setTransactions([]);
      setTransactionTotal(0);
      return;
    }
    setAccountId(id);
    if (data) {
      setAccount(data);
    }
    loadDetails(id);
  }, [loadDetails]);

  return (
    <div className="app-wrapper">
      <Toast toast={toast} onClose={closeToast} />

      <header className="navbar">
        <div className="navbar-container">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div>
              <div className="brand-title">BMS</div>
              <div className="brand-subtitle">Banking Management System</div>
            </div>
          </div>
          <nav className="nav-tabs">
            <button type="button" className={view === 'manage' ? 'nav-tab active' : 'nav-tab'} onClick={() => setView('manage')}>
              จัดการบัญชี
            </button>
            <button type="button" className={view === 'list' ? 'nav-tab active' : 'nav-tab'} onClick={() => setView('list')}>
              รายการบัญชีทั้งหมด
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {view === 'list' ? (
          <AccountList showToast={showToast} />
        ) : (
          <>
        <AccountManager
          accountId={accountId}
          selectAccount={selectAccount}
          showToast={showToast}
        />

        {accountId ? (
          <>
            <TransactionForm
              accountId={accountId}
              account={account}
              balance={balance}
              onTransactionSuccess={() => loadDetails(accountId)}
              showToast={showToast}
            />

            <TransactionHistory transactions={transactions} total={transactionTotal} />
          </>
        ) : (
          <div className="card empty-state animate-fade-in">
            <div className="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <h3 className="empty-state-title">
              ค้นหาบัญชี หรือเปิดบัญชีใหม่
            </h3>
            <p className="empty-state-desc">
              ใส่เลขที่บัญชีด้านบน หรือกด <strong>เปิดบัญชีใหม่</strong> เพื่อฝาก ถอน และดูธุรกรรม
            </p>
          </div>
        )}
          </>
        )}
      </main>

      <footer className="footer">
        © 2026 BMS — Banking Management System
      </footer>
    </div>
  );
}