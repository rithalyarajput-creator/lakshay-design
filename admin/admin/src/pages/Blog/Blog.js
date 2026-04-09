import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';

const EMPTY = { title:'', excerpt:'', content:'', image:'', author:'Amshine Team', tags:'', readTime:3, isPublished:false };

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/blog/admin/all');
      setPosts(res.data?.data || []);
    } catch { setPosts([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ title:p.title||'', excerpt:p.excerpt||'', content:p.content||'', image:p.image||'', author:p.author||'Amshine Team', tags:(p.tags||[]).join(', '), readTime:p.readTime||3, isPublished:p.isPublished||false });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const save = async () => {
    if (!form.title.trim()) { showToast('Title is required'); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/blog/${editing}`, form);
      else await api.post('/blog', form);
      showToast(editing ? 'Post updated!' : 'Post created!');
      closeForm(); load();
    } catch (e) { showToast('Error saving post'); } finally { setSaving(false); }
  };

  const togglePublish = async (p) => {
    try {
      await api.put(`/blog/${p._id}`, { ...p, isPublished: !p.isPublished });
      showToast(!p.isPublished ? 'Post published!' : 'Post unpublished');
      load();
    } catch { showToast('Error'); }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.delete(`/blog/${id}`); showToast('Deleted'); load(); } catch { showToast('Error'); }
  };

  const f = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const published = posts.filter(p => p.isPublished).length;
  const drafts = posts.filter(p => !p.isPublished).length;

  return (
    <div style={{ padding: '24px', fontFamily: "'Inter',sans-serif", maxWidth: 1200, margin: '0 auto' }}>
      {toast && <div style={{ position:'fixed', top:20, right:20, background:'#1e293b', color:'#fff', padding:'12px 20px', borderRadius:8, zIndex:9999, fontSize:13 }}>{toast}</div>}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0, color:'#1e293b' }}>Blog Posts</h1>
          <p style={{ fontSize:13, color:'#64748b', margin:'4px 0 0' }}>{posts.length} total · {published} published · {drafts} drafts</p>
        </div>
        <button onClick={openCreate} style={{ display:'flex', alignItems:'center', gap:8, background:'#6B1A2A', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontWeight:600, fontSize:13, cursor:'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Post
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[['Total Posts', posts.length, '#6B1A2A'], ['Published', published, '#16a34a'], ['Drafts', drafts, '#d97706']].map(([label, val, color]) => (
          <div key={label} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, padding:'16px 20px' }}>
            <div style={{ fontSize:26, fontWeight:700, color }}>{val}</div>
            <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Posts table */}
      <div style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:12, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center', color:'#64748b' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ padding:60, textAlign:'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom:12 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style={{ color:'#94a3b8', fontSize:14 }}>No posts yet. Create your first blog post!</p>
            <button onClick={openCreate} style={{ marginTop:12, background:'#6B1A2A', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:13, cursor:'pointer', fontWeight:600 }}>Create Post</button>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0' }}>
                {['Title','Status','Author','Date','Actions'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:600, color:'#64748b', letterSpacing:'0.5px', textTransform:'uppercase', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={p._id} style={{ borderBottom: i < posts.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ fontWeight:600, fontSize:14, color:'#1e293b', marginBottom:2 }}>{p.title}</div>
                    {p.excerpt && <div style={{ fontSize:12, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:300 }}>{p.excerpt}</div>}
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:600, background: p.isPublished ? '#dcfce7' : '#fef3c7', color: p.isPublished ? '#16a34a' : '#d97706' }}>
                      {p.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 16px', fontSize:13, color:'#64748b' }}>{p.author}</td>
                  <td style={{ padding:'14px 16px', fontSize:12, color:'#94a3b8', whiteSpace:'nowrap' }}>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}) : new Date(p.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => openEdit(p)} title="Edit" style={{ background:'#f1f5f9', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#475569' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => togglePublish(p)} title={p.isPublished ? 'Unpublish' : 'Publish'} style={{ background: p.isPublished ? '#fef3c7' : '#dcfce7', border:'none', borderRadius:6, padding:'6px 10px', cursor:'pointer', color: p.isPublished ? '#d97706' : '#16a34a', fontSize:11, fontWeight:600 }}>
                        {p.isPublished ? 'Unpublish' : 'Publish'}
                      </button>
                      <button onClick={() => del(p._id)} title="Delete" style={{ background:'#fee2e2', border:'none', borderRadius:6, padding:'6px 8px', cursor:'pointer', color:'#dc2626' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
          <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:680, maxHeight:'90vh', overflow:'auto', padding:28 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <h2 style={{ fontSize:18, fontWeight:700, color:'#1e293b', margin:0 }}>{editing ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={closeForm} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', padding:4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Title *</label>
                <input value={form.title} onChange={e=>f('title',e.target.value)} placeholder="Post title..." style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Excerpt (short summary)</label>
                <textarea value={form.excerpt} onChange={e=>f('excerpt',e.target.value)} placeholder="Brief description for cards..." rows={2} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, resize:'vertical', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Content (HTML supported)</label>
                <textarea value={form.content} onChange={e=>f('content',e.target.value)} placeholder="Full post content... You can use HTML tags like <p>, <h2>, <strong>, <em>, <ul>, <li>" rows={10} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:13, resize:'vertical', boxSizing:'border-box', fontFamily:'monospace' }} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Featured Image URL</label>
                <input value={form.image} onChange={e=>f('image',e.target.value)} placeholder="https://..." style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
                {form.image && <img src={form.image} alt="" style={{ marginTop:8, height:80, borderRadius:6, objectFit:'cover' }} onError={e=>e.target.style.display='none'} />}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Author</label>
                  <input value={form.author} onChange={e=>f('author',e.target.value)} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Read Time (min)</label>
                  <input type="number" min="1" value={form.readTime} onChange={e=>f('readTime',Number(e.target.value))} style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e=>f('tags',e.target.value)} placeholder="jewellery, gold, bridal..." style={{ width:'100%', padding:'10px 14px', border:'1px solid #e2e8f0', borderRadius:8, fontSize:14, boxSizing:'border-box' }} />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', userSelect:'none' }}>
                <input type="checkbox" checked={form.isPublished} onChange={e=>f('isPublished',e.target.checked)} style={{ width:16, height:16 }} />
                <span style={{ fontSize:14, fontWeight:600, color:'#374151' }}>Publish immediately</span>
              </label>
            </div>

            <div style={{ display:'flex', gap:12, marginTop:24, justifyContent:'flex-end' }}>
              <button onClick={closeForm} style={{ padding:'10px 20px', border:'1px solid #e2e8f0', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, color:'#64748b' }}>Cancel</button>
              <button onClick={save} disabled={saving} style={{ padding:'10px 24px', background:'#6B1A2A', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving...' : editing ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
