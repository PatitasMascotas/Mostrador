import React from 'react';
import { formatMoney, formatTime, formatDateTimeShort, dateKeyFromIso, saleTotal } from '../helpers';

export default function TicketRow({ sale, dayDate, onClick }) {
  const total = saleTotal(sale);
  const preview = (sale.items || []).map((i) => i.productName).join(', ');
  const payLabel = sale.paymentMethod === 'mp' ? 'MP' : sale.paymentMethod === 'efectivo' ? 'Efec' : sale.paymentMethod === 'mixto' ? 'Mixto' : null;
  const loadedElsewhere = dayDate && dateKeyFromIso(sale.createdAt) && dateKeyFromIso(sale.createdAt) !== dayDate;

  return (
    <div className="ticket" onClick={onClick}>
      <div className="ticket-perf" />
      <div className="ticket-body">
        <div className="ticket-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <span className="ticket-time mono">{formatTime(sale.createdAt)}</span>
            {payLabel && <span className="pay-badge">{payLabel}</span>}
            {loadedElsewhere && (
              <span className="pay-badge" style={{ background: 'var(--rust-dark)', color: '#fff' }} title="Fecha en que se cargó esta venta">
                Cargada el {formatDateTimeShort(sale.createdAt)}
              </span>
            )}
          </div>
          <span className="ticket-total mono">{formatMoney(total)}</span>
        </div>
        <div className="ticket-items-preview">{sale.items.length} producto{sale.items.length !== 1 ? 's' : ''} · {preview}</div>
      </div>
    </div>
  );
}
