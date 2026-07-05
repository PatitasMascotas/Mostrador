import React, { useState } from 'react';
import { Plus, Receipt, Coins } from 'lucide-react';
import { formatMoney, formatDateLong, saleTotal } from '../helpers';
import TicketRow from './TicketRow';

export default function DayView({ date, sales, onAddSale, onEditSale, showClosingButton, onOpenClosing, emptyHint }) {
  const [showTotal, setShowTotal] = useState(false);
  const total = sales.reduce((acc, s) => acc + saleTotal(s), 0);
  return (
    <div>
      <div className="m-day-header">
        <div className="m-day-title hand">{formatDateLong(date)}</div>
        {showTotal && (
          <>
            <div className="m-day-total-label">Total del día</div>
            <div className="m-day-total mono">{formatMoney(total)}</div>
          </>
        )}
      </div>

      {sales.length === 0 ? (
        <div className="m-empty">{emptyHint}</div>
      ) : (
        [...sales].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((s) => (
          <TicketRow key={s.id} sale={s} dayDate={date} onClick={() => onEditSale(s)} />
        ))
      )}

      <div className="m-actions">
        <button className="m-btn m-btn-amber m-btn-block" onClick={onAddSale}>
          <Plus size={18} /> Nueva venta
        </button>
        {showClosingButton && (
          <button className="m-btn m-btn-green m-btn-block" onClick={onOpenClosing} disabled={sales.length === 0}>
            <Receipt size={17} /> Cerrar caja
          </button>
        )}
      </div>

      <button
        className="total-toggle-fab"
        onClick={() => setShowTotal((v) => !v)}
        title={showTotal ? 'Ocultar total del día' : 'Ver total del día'}
      >
        <Coins size={18} />
      </button>
    </div>
  );
}
