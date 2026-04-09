import React from 'react';
import styles from './Table.module.css';

export default function Table({ columns, data, onRowClick, loading }) {
  if (loading) {
    return (
      <div className={styles.tableWrap}>
        <div className="loading-center"><div className="spinner spinner-lg" /></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={styles.tableWrap}>
        <div className="empty-state">
          <div className="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.3}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
          <h3>No data found</h3>
          <p>There's nothing to display yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? styles.clickable : ''}
            >
              {columns.map(col => (
                <td key={col.key}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
