import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Navbar.module.css';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Welcome back! Here\'s what\'s happening.' },
  '/products':  { title: 'Products', subtitle: 'Manage your product catalog' },
  '/orders':    { title: 'Orders', subtitle: 'Track and manage customer orders' },
  '/customers': { title: 'Customers', subtitle: 'View and manage customer accounts' },
  '/categories':{ title: 'Categories', subtitle: 'Organize your product categories' },
  '/settings':  { title: 'Settings', subtitle: 'Configure your store preferences' },
};

export default function Navbar({ onToggleSidebar }) {
  const { pathname } = useLocation();
  const page = PAGE_TITLES[pathname] || { title: 'Admin', subtitle: '' };

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onToggleSidebar}>
          <span /><span /><span />
        </button>
        <div>
          <h1 className={styles.pageTitle}>{page.title}</h1>
          {page.subtitle && <p className={styles.pageSubtitle}>{page.subtitle}</p>}
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.notif}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span className={styles.badge}>3</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.profile}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>Admin</span>
            <span className={styles.profileRole}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
