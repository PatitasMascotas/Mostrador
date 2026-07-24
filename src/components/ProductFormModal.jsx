import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

export default function ProductFormModal({ initial, onSave, onClose }) {
  const [name, setName] = useState(initial?.name || '');
  const [profit, setProfit] = useState(initial?.profit ?? '');

  const canSave = name.trim() && profit !== '' && !isNaN(parseFloat(profit));

  return (
    <div className="m-overlay" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="m-modal-header">
          <span className="m-modal-title">{initial ? 'Editar tipo de producto' : 'Nuevo tipo de producto'}</span>
          <button className="close-x" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="m-field">
          <span className="m-label">Nombre</span>
          <input className="m-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Alimento suelto" />
        </div>
        <div className="m-field">
          <span className="m-label">Ganancia sobre el costo (%)</span>
          <input className="m-input mono-input" type="number" inputMode="decimal" value={profit} onChange={(e) => setProfit(e.target.value)} placeholder="Ej: 30" onWheel={(e) => e.target.blur()} />
        </div>
        <button
          className="m-btn m-btn-amber m-btn-block"
          disabled={!canSave}
          onClick={() => onSave({ name: name.trim(), profit: parseFloat(profit) })}
        >
          <Check size={17} /> Guardar
        </button>
      </div>
    </div>
  );
}
