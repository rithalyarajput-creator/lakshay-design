import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const EMPTY = { name: '', location: '', text: '', rating: 5, isActive: true, order: 0 };

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { addToast } = useToast();

  const fetch_ = async () => {
    setLoading(true);
    try {
      const res = await api.get('/testimonials/all');
      setItems(res.data?.data || []);
    } catch { addToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch_(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditItem(null); setModalOpen(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ name:item.name, location:item.location, text:item.text, rating:item.rating, isActive:item.isActive, order:item.order||0 }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.text) { addToast('Name and review are required', 'error'); return; }
    setSaving(true);
    try {
      if (editItem) { await api.put(`/testimonials/${editItem._id}`, form); addToast('Updated!', 'success'); }
      else { await api.post('/testimonials', form); addToast('Added!', 'success'); }
      setModalOpen(false); fetch_();
    } catch { addToast('Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/testimonials/${deleteId}`);
      addToast('Deleted', 'success'); setDeleteId(null); fetch_();
    } catch { addToast('Failed', 'error'); }
    finally { setDeleting(false); }
  };

  const toggleActive = async (item) => {
    try {
      await api.put(`/testimonials/${item._id}`, { isActive: !item.isActive });
      setItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: !i.isActive } : i));
    } catch { addToast('Failed', 'error'); }
  };

  const StarInput = ({ value, onChange }) => (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} onClick={() => onChange(s)} style={{ cursor:'pointer', color:s<=value?'#B8860B':'#E5E7EB', display:'inline-block' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>
      ))}
    </div>
  );

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>Testimonials</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{items.length} reviews • Show on homepage</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Testimonial</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg"/></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px,1fr))', gap:16 }}>
          {items.map(item => (
            <div key={item._id} className="card" style={{ padding:20, opacity:item.isActive?1:0.6 }}>
              {/* Stars */}
              <div style={{ display:'flex', gap:2, marginBottom:10 }}>
                {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=item.rating?'#B8860B':'#E5E7EB', display:'inline-block' }}><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline-block',verticalAlign:'middle'}}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></span>)}
              </div>
              {/* Text */}
              <p style={{ fontSize:13, lineHeight:1.8, color:'#555', marginBottom:14, fontStyle:'italic' }}>"{item.text}"</p>
              {/* Author */}
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--maroon,#6B1A2A)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:14 }}>
                  {item.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{item.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{item.location}</div>
                </div>
                {/* Active toggle */}
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
                  <div style={{ width:36, height:20, borderRadius:10, background:item.isActive?'#10B981':'#E5E7EB', cursor:'pointer', position:'relative' }} onClick={() => toggleActive(item)}>
                    <div style={{ width:16, height:16, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left:item.isActive?18:2, transition:'all 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
                  </div>
                  <span style={{ fontSize:11, color:item.isActive?'#10B981':'#9CA3AF' }}>{item.isActive?'Active':'Hidden'}</span>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={() => openEdit(item)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(item._id)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'Edit Testimonial' : 'Add Testimonial'} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update' : 'Add'}</button>
          </>
        }
      >
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} placeholder="e.g. Priya Sharma" />
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input className="form-control" value={form.location} onChange={e => setForm(f => ({ ...f, location:e.target.value }))} placeholder="e.g. Mumbai" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Review *</label>
            <textarea className="form-control" value={form.text} onChange={e => setForm(f => ({ ...f, text:e.target.value }))} rows={4} placeholder="Customer review text..." />
          </div>
          <div className="form-group">
            <label className="form-label">Rating</label>
            <StarInput value={form.rating} onChange={val => setForm(f => ({ ...f, rating:val }))} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input className="form-control" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order:parseInt(e.target.value)||0 }))} placeholder="1, 2, 3..." />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <label style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, cursor:'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive:e.target.checked }))} />
                <span style={{ fontSize:14 }}>Show on website</span>
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Testimonial" message="Are you sure you want to delete this review?" />
    </div>
  );
}
