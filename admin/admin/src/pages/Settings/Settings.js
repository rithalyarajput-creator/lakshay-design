import React, { useState, useEffect } from 'react';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Settings.module.css';

const FONTS = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'Roboto'];
const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store');
  const [storeName, setStoreName] = useState('My eCommerce Store');
  const [currency, setCurrency] = useState('₹ INR');
  const [contactEmail, setContactEmail] = useState('');
  const [logo, setLogo] = useState([]);
  const [primaryColor, setPrimaryColor] = useState('#6C63FF');
  const [font, setFont] = useState('Plus Jakarta Sans');
  const [cardStyle, setCardStyle] = useState('rounded');
  const [bannerText, setBannerText] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    if (saved.storeName) setStoreName(saved.storeName);
    if (saved.currency) setCurrency(saved.currency);
    if (saved.contactEmail) setContactEmail(saved.contactEmail);
    if (saved.primaryColor) setPrimaryColor(saved.primaryColor);
    if (saved.font) setFont(saved.font);
    if (saved.cardStyle) setCardStyle(saved.cardStyle);
    if (saved.bannerText) setBannerText(saved.bannerText);
    // Also try API
    api.get('/settings').then(r => {
      const d = r.data;
      if (d.storeName) setStoreName(d.storeName);
      if (d.currency) setCurrency(d.currency);
      if (d.contactEmail) setContactEmail(d.contactEmail);
      if (d.primaryColor) setPrimaryColor(d.primaryColor);
      if (d.font) setFont(d.font);
      if (d.cardStyle) setCardStyle(d.cardStyle);
      if (d.bannerText) setBannerText(d.bannerText);
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const settings = { storeName, currency, contactEmail, primaryColor, font, cardStyle, bannerText };
    try {
      localStorage.setItem('storeSettings', JSON.stringify(settings));

      const fd = new FormData();
      Object.entries(settings).forEach(([k, v]) => fd.append(k, v));
      if (logo[0]?.file) fd.append('logo', logo[0].file);

      await api.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .catch(() => {}); // API optional

      // Apply theme live
      document.documentElement.style.setProperty('--primary', primaryColor);
      addToast('Settings saved successfully!', 'success');
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className={styles.tabs}>
        {['store', 'theme'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'store' ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> Store Settings</> : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg> Theme Settings</>}
          </button>
        ))}
      </div>

      <div className={`card ${styles.settingsCard}`}>
        {activeTab === 'store' ? (
          <>
            <h3 className={styles.sectionTitle}>Store Information</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input className="form-control" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="My Store" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-control" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@store.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="divider" />
            <h3 className={styles.sectionTitle}>Store Logo</h3>
            <ImageUpload images={logo} onChange={setLogo} multiple={false} />
          </>
        ) : (
          <>
            <h3 className={styles.sectionTitle}>Theme Configuration</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <div className={styles.colorRow}>
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={styles.colorPicker} />
                  <input className="form-control" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#6C63FF" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Font Family</label>
                <select className="form-control" value={font} onChange={e => setFont(e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Card Style</label>
              <div className={styles.toggleRow}>
                {['rounded', 'square'].map(s => (
                  <button
                    key={s}
                    className={`${styles.styleBtn} ${cardStyle === s ? styles.styleBtnActive : ''}`}
                    onClick={() => setCardStyle(s)}
                  >
                    <span className={styles.styleIcon}>{s === 'rounded' ? '●' : '■'}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>This setting affects product card corners on the main frontend website</p>
            </div>

            <div className="form-group">
              <label className="form-label">Homepage Banner Text</label>
              <textarea
                className="form-control"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                placeholder="Enter your homepage banner headline..."
                rows={3}
              />
            </div>

            <div className={styles.previewBox}>
              <div
                className={styles.previewCard}
                style={{
                  borderRadius: cardStyle === 'rounded' ? 16 : 0,
                  fontFamily: font,
                  borderTop: `4px solid ${primaryColor}`,
                }}
              >
                <div className={styles.previewImg} style={{ background: primaryColor + '22', display:'flex', alignItems:'center', justifyContent:'center' }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{opacity:0.5}}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg></div>
                <div className={styles.previewBody}>
                  <div className={styles.previewTitle} style={{ fontFamily: font }}>Sample Product</div>
                  <div className={styles.previewPrice} style={{ color: primaryColor }}>₹1,299</div>
                  <div className={styles.previewBtn} style={{ background: primaryColor }}>Add to Cart</div>
                </div>
              </div>
              <p className={styles.previewLabel}>Live Card Preview</p>
            </div>
          </>
        )}

        <div className={styles.saveRow}>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save Settings</>}
          </button>
        </div>
      </div>
    </div>
  );
}
