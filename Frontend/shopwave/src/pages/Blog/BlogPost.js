import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    fetch(`${API}/blog/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d?.data) setPost(d.data);
        else navigate('/blog', { replace: true });
      })
      .catch(() => navigate('/blog', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  useEffect(() => {
    fetch(`${API}/blog`)
      .then(r => r.json())
      .then(d => {
        const all = d?.data || [];
        setRelated(all.filter(p => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {});
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#FDFAF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#B8860B', fontFamily: 'Georgia,serif', fontSize: '18px' }}>Loading...</div>
    </div>
  );

  if (!post) return null;

  return (
    <div style={{ background: '#FDFAF5', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg,#1C0A00,#3D1A00)', padding: 'clamp(48px,8vw,80px) clamp(16px,5vw,48px) 0', textAlign: 'center' }}>
        {post.tags && post.tags.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {post.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#B8860B', background: 'rgba(184,134,11,0.15)', padding: '3px 12px', borderRadius: '999px', border: '1px solid rgba(184,134,11,0.3)' }}>{tag}</span>
            ))}
          </div>
        )}
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(26px,4.5vw,48px)', fontWeight: 600, color: '#FFF8EE', maxWidth: '800px', margin: '0 auto 20px', lineHeight: 1.25 }}>{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', padding: '20px 0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#d4af37,#b8860b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff' }}>
              {(post.author || 'A')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,248,238,0.8)', fontWeight: 500 }}>{post.author || 'Amshine Team'}</span>
          </div>
          <span style={{ color: 'rgba(255,248,238,0.3)', fontSize: '12px' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,248,238,0.6)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {post.readTime || 3} min read
          </div>
          {post.publishedAt && (
            <>
              <span style={{ color: 'rgba(255,248,238,0.3)', fontSize: '12px' }}>|</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'rgba(255,248,238,0.6)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cover image */}
      {post.image && (
        <div style={{ maxWidth: '800px', margin: '-1px auto 0', padding: '0 clamp(16px,4vw,40px)' }}>
          <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: '0 0 16px 16px', maxHeight: '420px', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
        </div>
      )}

      {/* Content */}
      <article style={{ maxWidth: '740px', margin: '0 auto', padding: 'clamp(32px,5vw,56px) clamp(16px,4vw,40px)' }}>
        {/* Back link */}
        <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#B8860B', textDecoration: 'none', marginBottom: '32px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Blog
        </Link>

        <div
          dangerouslySetInnerHTML={{ __html: post.content }}
          style={{ fontSize: '16px', lineHeight: 1.9, color: '#3C2A1E' }}
          className="blog-content"
        />
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <div style={{ background: '#fff', borderTop: '1px solid #EDE4D4', padding: 'clamp(32px,5vw,64px) clamp(16px,4vw,40px)' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#B8860B', marginBottom: '8px' }}>Keep Reading</div>
              <h2 style={{ fontFamily: 'Georgia,serif', fontSize: '28px', fontWeight: 600, color: '#1C0A00', margin: 0 }}>More Articles</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '24px' }}>
              {related.map(p => (
                <Link key={p._id} to={`/blog/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#FDFAF5', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(184,134,11,0.1)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    {p.image && <img src={p.image} alt={p.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />}
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontFamily: 'Georgia,serif', fontSize: '16px', color: '#1C0A00', margin: '0 0 6px', lineHeight: 1.4 }}>{p.title}</h3>
                      <p style={{ fontSize: '13px', color: '#7A6650', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.excerpt}</p>
                      <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#B8860B', textTransform: 'uppercase' }}>Read More →</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .blog-content h1,.blog-content h2,.blog-content h3 { font-family:Georgia,serif; color:#1C0A00; margin-top:36px; margin-bottom:12px; line-height:1.3; }
        .blog-content h1 { font-size:clamp(24px,3vw,36px); }
        .blog-content h2 { font-size:clamp(20px,2.5vw,28px); }
        .blog-content h3 { font-size:clamp(17px,2vw,22px); }
        .blog-content p { margin-bottom:18px; }
        .blog-content ul,.blog-content ol { padding-left:24px; margin-bottom:18px; }
        .blog-content li { margin-bottom:8px; }
        .blog-content img { max-width:100%; border-radius:10px; margin:16px 0; }
        .blog-content a { color:#B8860B; }
        .blog-content blockquote { border-left:3px solid #B8860B; padding:12px 20px; margin:24px 0; background:rgba(184,134,11,0.06); border-radius:0 8px 8px 0; color:#5C4A35; font-style:italic; }
        .blog-content strong { color:#1C0A00; }
      `}</style>
      <Footer />
    </div>
  );
}
