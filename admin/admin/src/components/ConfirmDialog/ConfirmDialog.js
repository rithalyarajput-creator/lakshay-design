import React from 'react';
import Modal from '../Modal/Modal';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="sm"
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Delete'}
          </button>
        </>
      }
    >
      <div className={styles.content}>
        <div className={styles.icon}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <p className={styles.message}>{message || 'Are you sure? This action cannot be undone.'}</p>
      </div>
    </Modal>
  );
}
