import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import styles from './About.module.css';

const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const About = () => {
  const [cmsData, setCmsData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(API + '/cms/about')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const c = data?.data?.content || data?.content;
        if (c && c.length > 20) setCmsData(c);
      })
      .catch(() => {});
  }, []);

  // CMS se sirf description paragraphs aate hain — design same rehta hai
  const heroDesc = cmsData
    ? null
    : 'At Amshine, we believe every piece of jewellery tells a story of love, celebration, heritage, and craftsmanship passed down through generations.';

  const missionText1 = cmsData
    ? null
    : 'Amshine Jewellery was born from a passion for preserving the rich tradition of Indian jewellery-making. Every piece in our collection is handcrafted by skilled artisans who have dedicated their lives to this beautiful craft.';

  const missionText2 = cmsData
    ? null
    : 'We use only BIS hallmarked 22K gold and certified gemstones, ensuring that every piece you receive meets the highest standards of quality and purity.';

  return (
    <div>
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Our Story</div>
            <h1 className={styles.heroTitle}>Crafting <em>Timeless</em><br />Jewellery Since 2000</h1>
            {heroDesc && <p className={styles.heroDesc}>{heroDesc}</p>}
          </div>
        </div>

        {/* Mission */}
        <section className={styles.section}>
          <div className={styles.missionGrid}>
            <div className={styles.missionLeft}>
              <div className={styles.eyebrow}>Who We Are</div>
              <h2 className={styles.sectionTitle}>Handcrafted with <em>Love</em></h2>

              {/* CMS content ya default text */}
              {cmsData ? (
                <div
                  className={styles.para}
                  dangerouslySetInnerHTML={{ __html: cmsData }}
                  style={{ fontSize: 15, lineHeight: 2, color: '#555' }}
                />
              ) : (
                <>
                  <p className={styles.para}>{missionText1}</p>
                  <p className={styles.para}>{missionText2}</p>
                </>
              )}

              <Link to="/products" className="btn-fill"><span>Explore Collection</span></Link>
            </div>
            <div className={styles.missionRight}>
              <div className={styles.statsGrid}>
                {[
                  { num: '25+', label: 'Years of Craftsmanship' },
                  { num: '12K+', label: 'Happy Brides' },
                  { num: '600+', label: 'Unique Designs' },
                  { num: '22K', label: 'Pure Gold Standard' },
                ].map((s, i) => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.statNum}>{s.num}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.valuesSection}>
          <div className={styles.valuesInner}>
            <div className={styles.eyebrow} style={{ textAlign: 'center' }}>Our Promise</div>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '48px' }}>Why Choose <em>Amshine</em></h2>
            <div className={styles.valuesGrid}>
              {[
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>, title: 'BIS Hallmarked', desc: 'All gold pieces carry the BIS hallmark, guaranteeing 22K purity certified by the Bureau of Indian Standards.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, title: 'Handcrafted', desc: 'Every piece is handmade by master artisans using centuries-old techniques passed down through generations.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Free Shipping', desc: 'Free insured shipping across India on orders above Rs.5,000. Your jewellery arrives safely, every time.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>, title: '30-Day Returns', desc: 'Not happy? Return within 30 days for a full refund or exchange, no questions asked.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 3h12l4 6-10 13L2 9 6 3z"/><path d="M11 3L8 9l4 13 4-13-3-6"/><path d="M2 9h20"/></svg>, title: 'Lifetime Polish', desc: 'Free cleaning and minor repairs for the lifetime of your jewellery. We stand behind every piece we make.' },
                { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, title: 'Luxury Packaging', desc: 'Each piece arrives in our signature gift box, ready to be gifted or treasured for generations.' },
              ].map((v, i) => (
                <div key={i} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{v.icon}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.eyebrow}>Ready to Shop?</div>
          <h2 className={styles.ctaTitle}>Find Your Perfect <em>Piece</em></h2>
          <p className={styles.ctaDesc}>Browse our curated collection of handcrafted jewellery for every occasion.</p>
          <div className={styles.ctaBtns}>
            <Link to="/products" className="btn-fill"><span>Shop Now</span></Link>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;