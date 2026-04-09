import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const BlogCard = ({ post }) => (
  <article style={{
    background: '#fff',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 16px rgba(107,26,42,0.07)',
    border: '1px solid rgba(184,134,11,0.1)',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(107,26,42,0.14)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(107,26,42,0.07)'; }}
  >
    {post.image ? (
      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img src={post.image} alt={post.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          onError={e => { e.target.parentElement.style.display = 'none'; }}
        />
      </div>
    ) : (
      <div style={{ height: '160px', background: 'linear-gradient(135deg,#f5e8d0,#e8d4b0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(184,134,11,0.4)" strokeWidth="1.5"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      </div>
    )}
    <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {post.tags && post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {post.tags.slice(0, 2).map((tag, i) => (
            <span key={i} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B8860B', background: 'rgba(184,134,11,0.1)', padding: '3px 10px', borderRadius: '999px' }}>{tag}</span>
          ))}
        </div>
      )}
      <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '19px', fontWeight: 600, color: '#1C0A00', lineHeight: 1.35, margin: '0 0 10px' }}>{post.title}</h2>
      <p style={{ fontSize: '14px', color: '#7A6650', lineHeight: 1.75, margin: '0 0 20px', flex: 1 }}>{post.excerpt}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg,#d4af37,#b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#fff' }}>
            {(post.author || 'A')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#1C0A00' }}>{post.author || 'Amshine Team'}</div>
            <div style={{ fontSize: '11px', color: '#A08060' }}>{post.readTime || 3} min read</div>
          </div>
        </div>
        <Link to={`/blog/${post.slug}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          color: '#B8860B', textDecoration: 'none',
          padding: '8px 16px', borderRadius: '6px', border: '1.5px solid rgba(184,134,11,0.3)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#B8860B'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8860B'; }}
        >
          Read More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  </article>
);

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(`${API}/blog`)
      .then(r => r.json())
      .then(d => setPosts(d?.data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const allTags = ['All', ...Array.from(new Set(posts.flatMap(p => p.tags || [])))];

  const filtered = posts.filter(p => {
    const matchTag = tag === 'All' || (p.tags || []).includes(tag);
    const q = search.trim().toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
    return matchTag && matchSearch;
  });

  return (
    <div style={{ background: '#FDFAF5', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#1C0A00,#3D1A00)', padding: 'clamp(60px,10vw,96px) 24px 60px', textAlign: 'center' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#B8860B', marginBottom: '12px' }}>Our Journal</div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(32px,5vw,56px)', fontWeight: 600, color: '#FFF8EE', margin: '0 0 14px' }}>
          Stories of <em style={{ color: '#B8860B' }}>Elegance</em>
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,248,238,0.6)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 1.75 }}>
          Jewellery care tips, style guides, and stories from the world of fine craftsmanship.
        </p>
        <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
          <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(184,134,11,0.7)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..." style={{ width: '100%', padding: '13px 18px 13px 42px', borderRadius: '10px', border: '1.5px solid rgba(184,134,11,0.3)', background: 'rgba(255,255,255,0.07)', color: '#FFF8EE', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 1 && (
        <div style={{ background: '#fff', borderBottom: '1px solid #EDE4D4', padding: '16px 24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {allTags.map(t => (
            <button key={t} onClick={() => setTag(t)} style={{ padding: '6px 16px', borderRadius: '999px', border: '1.5px solid', borderColor: tag === t ? '#1C0A00' : '#E8DCC8', background: tag === t ? '#1C0A00' : '#fff', color: tag === t ? '#F5DEB3' : '#7A6650', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all .2s' }}>{t}</button>
          ))}
        </div>
      )}

      {/* Posts grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '22px', fontWeight: 600, color: '#1C0A00', margin: 0 }}>
            {loading ? 'Loading...' : `${filtered.length} Article${filtered.length !== 1 ? 's' : ''}`}
          </h2>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#fff', borderRadius: '16px', height: '360px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: '#A08060' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="rgba(184,134,11,0.3)" strokeWidth="1.5" style={{ marginBottom: '16px' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <p style={{ fontSize: '16px', fontFamily: 'Georgia,serif' }}>No articles found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '24px' }}>
            {filtered.map(post => <BlogCard key={post._id} post={post} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
