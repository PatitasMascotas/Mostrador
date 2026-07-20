import React, { useState } from 'react';
import { X, Check, Trash2, Plus, Minus } from 'lucide-react';
import { formatMoney, formatDateShort, todayStr, uid } from '../helpers';

function saldoDe(movimientos) {
  return (movimientos || []).reduce((acc, m) => acc + (m.tipo === 'debe' ? m.monto : -m.monto), 0);
}

export default function ClienteFiadoModal({ initial, onSave, onDelete, onClose }) {
  const [clientId] = useState(initial?.id || uid());
  const [createdAt] = useState(initial?.createdAt || new Date().toISOString());
  const [nombre, setNombre] = useState(initial?.nombre || '');
  const [movimientos, setMovimientos] = useState(initial?.movimientos ? [...initial.movimientos] : []);
  const [everSaved, setEverSaved] = useState(!!initial);

  const [addingType, setAddingType] = useState(null);
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(todayStr());

  const saldo = saldoDe(movimientos);

  const startAdd = (tipo) => {
    if (!everSaved && !nombre.trim()) return;
    setAddingType(tipo);
    setMonto('');
    setDescripcion('');
    setFecha(todayStr());
  };

  const persist = (nextMovimientos) => {
    onSave({ id: clientId, nombre: nombre.trim(), movimientos: nextMovimientos, createdAt });
  };

  const confirmAdd = () => {
    const val = parseFloat(monto);
    if (!val || val <= 0) return;
    if (!nombre.trim()) return;
    const nextMovs = [
      ...movimientos,
      { id: uid(), tipo: addingType, monto: val, descripcion: descripcion.trim(), fecha, createdAt: new Date().toISOString() },
    ];
    setMovimientos(nextMovs);
    persist(nextMovs);
    setEverSaved(true);
    setAddingType(null);
    setMonto('');
    setDescripcion('');
  };

  const removeMovimiento = (id) => {
    if (!window.confirm('¿Eliminar este movimiento?')) return;
    const next = movimientos.filter((m) => m.id !== id);
    setMovimientos(next);
    persist(next);
  };

  const sorted = [...movimientos].sort((a, b) =>
    b.fecha === a.fecha ? (b.createdAt || '').localeCompare(a.createdAt || '') : b.fecha.localeCompare(a.fecha)
  );

  const canStartMovement = nombre.trim().length > 0;

  return (
    <div className="m-overlay" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <div className="m-modal-header">
          <span className="m-modal-title">{everSaved ? nombre : 'Nuevo cliente'}</span>
          <button className="close-x" onClick={onClose}><X size={18} /></button>
        </div>

        {!everSaved && (
          <div className="m-field">
            <span className="m-label">Nombre del cliente</span>
            <input
              className="m-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre o apodo"
              autoFocus
            />
          </div>
        )}

        {everSaved && (
          <div style={{ marginBottom: 16 }}>
            <span className="m-day-total-label">Saldo</span>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: saldo > 0 ? 'var(--rust)' : 'var(--green)' }}>
              {saldo > 0 ? formatMoney(saldo) : 'Sin deuda'}
            </div>
          </div>
        )}

        {movimientos.length > 0 && (
          <div className="m-card" style={{ background: 'var(--paper)', color: 'var(--ink)', maxHeight: 220, overflowY: 'auto' }}>
            {sorted.map((m) => (
              <div className="line-item" key={m.id}>
                <div className="line-left">
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: 999, marginRight: 4, flexShrink: 0, marginTop: 2,
                      background: m.tipo === 'debe' ? 'rgba(181,83,60,0.18)' : 'rgba(76,122,82,0.18)',
                      color: m.tipo === 'debe' ? 'var(--rust-dark)' : 'var(--green-dark)',
                    }}
                  >
                    {m.tipo === 'debe' ? 'Debe' : 'Pagó'}
                  </span>
                  <div>
                    <div className="line-name">{formatDateShort(m.fecha)}</div>
                    {m.descripcion && <div className="line-desc">{m.descripcion}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="line-price" style={{ color: m.tipo === 'debe' ? 'var(--rust-dark)' : 'var(--green-dark)' }}>
                    {m.tipo === 'debe' ? '+' : '−'}{formatMoney(m.monto)}
                  </span>
                  <button className="line-remove" onClick={() => removeMovimiento(m.id)}><X size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {addingType ? (
          <div className="m-card" style={{ background: 'var(--paper)', color: 'var(--ink)', marginTop: movimientos.length > 0 ? 12 : 0 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, color: addingType === 'debe' ? 'var(--rust-dark)' : 'var(--green-dark)' }}>
              {addingType === 'debe' ? 'Agregar deuda' : 'Registrar pago'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="m-field" style={{ flex: 1 }}>
                <span className="m-label">Monto</span>
                <input
                  className="m-input mono-input" type="number" inputMode="decimal"
                  value={monto} onChange={(e) => setMonto(e.target.value)} placeholder="0" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmAdd(); }}
                />
              </div>
              <div className="m-field" style={{ flex: 1 }}>
                <span className="m-label">Fecha</span>
                <input className="m-input mono-input" type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
            </div>
            <div className="m-field">
              <span className="m-label">Descripción (opcional)</span>
              <input
                className="m-input" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                placeholder={addingType === 'debe' ? 'Ej: 2 bolsas de alimento' : 'Ej: seña'}
              />
            </div>
            <div className="m-actions" style={{ marginTop: 4 }}>
              <button className="m-btn m-btn-ghost m-btn-block" onClick={() => setAddingType(null)}>Cancelar</button>
              <button
                className={`m-btn m-btn-block ${addingType === 'debe' ? 'm-btn-rust' : 'm-btn-green'}`}
                onClick={confirmAdd}
                disabled={!monto || parseFloat(monto) <= 0}
              >
                <Check size={17} /> Confirmar
              </button>
            </div>
          </div>
        ) : (
          <div className="m-actions" style={{ marginTop: movimientos.length > 0 ? 14 : 0 }}>
            <button className="m-btn m-btn-rust m-btn-block" onClick={() => startAdd('debe')} disabled={!canStartMovement}>
              <Plus size={17} /> Agregar deuda
            </button>
            <button className="m-btn m-btn-green m-btn-block" onClick={() => startAdd('paga')} disabled={!canStartMovement}>
              <Minus size={17} /> Registrar pago
            </button>
          </div>
        )}

        {everSaved && (
          <div className="m-actions">
            <button className="m-btn m-btn-ghost m-btn-block" onClick={() => onDelete(clientId)}>
              <Trash2 size={16} /> Eliminar cliente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
