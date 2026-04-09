import React, { useRef, useState } from 'react';
import styles from './ImageUpload.module.css';

export default function ImageUpload({ images = [], onChange, multiple = true }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFiles = (files) => {
    const fileArr = Array.from(files);
    const previews = fileArr.map(f => ({
      file: f,
      preview: URL.createObjectURL(f),
    }));
    if (multiple) onChange([...images, ...previews]);
    else onChange(previews.slice(0, 1));
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx) => {
    const updated = images.filter((_, i) => i !== idx);
    onChange(updated);
  };

  return (
    <div className={styles.wrap}>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <div className={styles.dropIcon}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:0.5}}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
        <div className={styles.dropText}>
          <strong>Click to upload</strong> or drag & drop
        </div>
        <div className={styles.dropSub}>PNG, JPG, WEBP up to 10MB</div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {images.length > 0 && (
        <div className={styles.previewGrid}>
          {images.map((img, i) => (
            <div key={i} className={styles.previewItem}>
              <img src={img.preview || img.url || img} alt="" className={styles.previewImg} />
              <button className={styles.removeBtn} onClick={() => removeImage(i)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
