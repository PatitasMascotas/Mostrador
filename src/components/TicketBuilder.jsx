import React, { useState } from 'react';
import { PawPrint, Plus, X, Check, Trash2, Pencil } from 'lucide-react';
import { formatMoney, uid } from '../helpers';

export default function TicketBuilder({ products, initialSale, onSave, onDelete, onClose }) {
  const [items, setItems] = useState(initialSale ? initialSale.items.map((i) => ({ ...i })) : []);
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(initialSale?.paymentMethod || '');
  const [cashAmount, setCashAmount] = useState(initialSale?.cashAmount != null ? String(initialSale.cashAmount) : '');
  const [mpAmount, setMpAmount] = useState(initialSale?.mpAmount != null ? String(initialSale.mpAmount) : '');

  const isEditing = !!initialSale;
  const total = items.reduce((acc, it) => acc + it.price, 0);
  const [editingDescId, setEditingDescId] = useState(null);
  const [descDraft, setDescDraft] = useState('');

  const startEditDesc = (item) => {
    setEditingDescId(item.id);
    setDescDraft(item.description || '');
  };
  const commitDesc = (id) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, description: descDraft.trim() } : i)));
    setEditingDescId(null);
  };

  const unitPriceNum = parseFloat(price) || 0;
  const quantityNum = quantity.trim() === '' ? 1 : (parseFloat(quantity.replace(',', '.')) || 0);
  const computedTotal = unitPriceNum * quantityNum;

  const addItem = () => {
    const p = products.find((pr) => pr.id === productId);
    if (!p || !computedTotal || computedTotal <= 0) return;
    setItems((prev) => [
      ...prev,
      {
        id: uid(),
        productId: p.id,
        productName: p.name,
        profitPercentAtSale: p.profit,
        price: Math.round(computedTotal * 100) / 100,
        ...(quantityNum !== 1 ? { unitPrice: unitPriceNum, quantity: quantityNum } : {}),
        description: description.trim(),
      },
    ]);
    setProductId('');
    setPrice('');
    setQuantity('1');
    setDescription('');
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const cashNum = parseFloat(cashAmount) || 0;
  const mpNum = parseFloat(mpAmount) || 0;
  const mixtoOk = paymentMethod !== 'mixto' || (cashAmount !== '' && mpAmount !== '' && Math.abs(cashNum + mpNum - total) < 0.5);
  const hasPendingDraft = !!productId || price.trim() !== '' || (quantity.trim() !== '' && quantity.trim() !== '1');
  const canSave = items.length > 0 && !!paymentMethod && mixtoOk && !hasPendingDraft;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: initialSale ? initialSale.id : uid(),
      items,
      paymentMethod,
      ...(paymentMethod === 'mixto' ? { cashAmount: cashNum, mpAmount: mpNum } : {}),
      createdAt: initialSale ? initialSale.createdAt : new Date().toISOString(),
    });
  };

  return (
    <div className="m-overlay" onClick={onClose}>
      <div className="m-modal" onClick={(e) => e.stopPropagation()}>
        <div className="m-modal-header">
          <span className="m-modal-title">{isEditing ? 'Editar venta' : 'Nueva venta'}</span>
          <button className="close-x" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="m-card" style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
          <div className="m-field" style={{ marginBottom: 10 }}>
            <span className="m-label">Tipo de producto</span>
            <div className="pill-grid">
              {products.map((p) => (
                <button
                  key={p.id}
                  className={`pill ${productId === p.id ? 'selected' : ''}`}
                  onClick={() => setProductId((prev) => (prev === p.id ? '' : p.id))}
                  type="button"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div className="m-field" style={{ flex: 1, marginBottom: 10 }}>
              <span className="m-label">Precio {quantityNum !== 1 ? '(por kilo)' : ''}</span>
              <input
                className="m-input mono-input"
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
                onWheel={(e) => e.target.blur()}
              />
            </div>
            <div className="m-field" style={{ flex: 1, marginBottom: 10 }}>
              <span className="m-label">Cantidad (kg)</span>
              <input
                className="m-input mono-input"
                type="text"
                inputMode="decimal"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
              />
            </div>
          </div>

          <div className="m-field" style={{ marginBottom: 10 }}>
            <span className="m-label">Descripción (opcional)</span>
            <input
              className="m-input"
              type="text"
              placeholder="Ej: bolsa 15kg"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addItem(); }}
            />
          </div>

          {price !== '' && quantityNum !== 1 && (
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>
              Total a agregar: <b style={{ color: 'var(--ink)' }}>{formatMoney(computedTotal)}</b>
              {' '}({formatMoney(unitPriceNum)} × {quantity.replace('.', ',')} kg)
            </div>
          )}

          <button className="m-btn m-btn-amber m-btn-block" onClick={addItem} disabled={!productId || !price || !computedTotal}>
            <Plus size={17} /> Agregar producto
          </button>

          {items.length > 0 && (
            <div style={{ marginTop: 16 }}>
              {items.map((it) => (
                <div className="line-item" key={it.id}>
                  <div className="line-left">
                    <PawPrint size={11} style={{ marginTop: 4, flexShrink: 0, color: 'var(--ink-soft)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="line-name">{it.productName}</div>
                      {it.unitPrice && it.quantity && (
                        <div className="line-desc" style={{ fontStyle: 'normal' }}>
                          {formatMoney(it.unitPrice)}/kg × {String(it.quantity).replace('.', ',')} kg
                        </div>
                      )}
                      {editingDescId === it.id ? (
                        <input
                          className="m-input"
                          style={{ marginTop: 4, padding: '6px 8px', fontSize: 12.5 }}
                          autoFocus
                          value={descDraft}
                          onChange={(e) => setDescDraft(e.target.value)}
                          onBlur={() => commitDesc(it.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitDesc(it.id); }}
                          placeholder="Descripción"
                        />
                      ) : it.description ? (
                        <div className="line-desc" style={{ cursor: 'pointer' }} onClick={() => startEditDesc(it)}>
                          {it.description} <Pencil size={10} style={{ verticalAlign: 'middle', marginLeft: 3, opacity: 0.6 }} />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditDesc(it)}
                          style={{ background: 'none', border: 'none', padding: 0, marginTop: 2, fontSize: 11.5, color: 'var(--ink-soft)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          + Agregar descripción
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="line-price">{formatMoney(it.price)}</span>
                    <button className="line-remove" onClick={() => removeItem(it.id)}><X size={15} /></button>
                  </div>
                </div>
              ))}
              <div className="subtotal-row">
                <span className="subtotal-label">Total venta</span>
                <span className="subtotal-value">{formatMoney(total)}</span>
              </div>

              <div className="m-field" style={{ marginTop: 16, marginBottom: 0 }}>
                <span className="m-label">Forma de pago</span>
                <div className="pill-grid">
                  <button
                    type="button"
                    className={`pill ${paymentMethod === 'efectivo' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('efectivo')}
                  >
                    Efectivo
                  </button>
                  <button
                    type="button"
                    className={`pill ${paymentMethod === 'mp' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('mp')}
                  >
                    Mercado Pago
                  </button>
                  <button
                    type="button"
                    className={`pill ${paymentMethod === 'mixto' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('mixto')}
                  >
                    Mixto
                  </button>
                </div>
              </div>

              {paymentMethod === 'mixto' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                  <div className="m-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span className="m-label">Efectivo</span>
                    <input
                      className="m-input mono-input"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  <div className="m-field" style={{ flex: 1, marginBottom: 0 }}>
                    <span className="m-label">Mercado Pago</span>
                    <input
                      className="m-input mono-input"
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={mpAmount}
                      onChange={(e) => setMpAmount(e.target.value)}
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
              )}
              {paymentMethod === 'mixto' && !mixtoOk && (
                <div style={{ fontSize: 11.5, color: 'var(--rust-dark)', marginTop: 6 }}>
                  La suma de efectivo y Mercado Pago debe ser igual al total ({formatMoney(total)}).
                </div>
              )}
            </div>
          )}
        </div>

        {hasPendingDraft && (
          <div className="m-warning" style={{ marginTop: 14, marginBottom: 0 }}>
            <div className="m-warning-text">
              Tenés un producto cargado que todavía no agregaste a la venta.
              Tocá <b>"Agregar producto"</b> (o borrá esos campos) antes de guardar.
            </div>
          </div>
        )}

        <div className="m-actions">
          {isEditing && (
            <button className="m-btn m-btn-rust" onClick={() => onDelete(initialSale.id)}>
              <Trash2 size={16} />
            </button>
          )}
          <button className="m-btn m-btn-green m-btn-block" onClick={handleSave} disabled={!canSave}>
            <Check size={17} /> {isEditing ? 'Guardar cambios' : 'Guardar venta'}
          </button>
        </div>
      </div>
    </div>
  );
}