import React, { useMemo } from 'react';
import { Check } from 'lucide-react';
import { formatMoney, formatDateLong, summarizeSales } from '../helpers';

export default function ClosingSummary({ date, sales, onConfirm, onCancel, confirmMode, finalizing }) {
  const { total, gananciaTotal, reposicionTotal, byType, byPayment } = useMemo(() => summarizeSales(sales), [sales]);
  const rows = Object.values(byType).sort((a, b) => b.total - a.total);

  return (
    <div className="ticket-torn">
      <div className="ticket-body">
        <div className="hand" style={{ fontSize: 20, marginBottom: 2 }}>{formatDateLong(date)}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>{sales.length} venta{sales.length !== 1 ? 's' : ''} registrada{sales.length !== 1 ? 's' : ''}</div>

        <div className="totals-strip">
          <div className="totals-box">
            <div className="tlabel">Total</div>
            <div className="tval">{formatMoney(total)}</div>
          </div>
          <div className="totals-box">
            <div className="tlabel">Ganancia</div>
            <div className="tval" style={{ color: 'var(--green-dark)' }}>{formatMoney(gananciaTotal)}</div>
          </div>
          <div className="totals-box">
            <div className="tlabel">Reposición</div>
            <div className="tval" style={{ color: 'var(--rust-dark)' }}>{formatMoney(reposicionTotal)}</div>
          </div>
        </div>

        <div className="totals-strip" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="totals-box">
            <div className="tlabel">Efectivo</div>
            <div className="tval">{formatMoney(byPayment.efectivo)}</div>
          </div>
          <div className="totals-box">
            <div className="tlabel">Mercado Pago</div>
            <div className="tval">{formatMoney(byPayment.mp)}</div>
          </div>
        </div>

        {rows.length > 0 && (
          <table className="summary-table">
            <thead>
              <tr>
                <th>Tipo de producto</th>
                <th className="num">Vendido</th>
                <th className="num">Ganancia</th>
                <th className="num">Reposición</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td>{r.name} <span style={{ color: 'var(--ink-soft)' }}>×{r.count}</span></td>
                  <td className="num">{formatMoney(r.total)}</td>
                  <td className="num" style={{ color: 'var(--green-dark)' }}>{formatMoney(r.ganancia)}</td>
                  <td className="num" style={{ color: 'var(--rust-dark)' }}>{formatMoney(r.reposicion)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {confirmMode && (
          <div className="m-actions">
            <button className="m-btn m-btn-ghost m-btn-block" onClick={onCancel} disabled={finalizing}>Volver</button>
            <button className="m-btn m-btn-green m-btn-block" onClick={onConfirm} disabled={finalizing}>
              {finalizing ? 'Cerrando caja...' : (<><Check size={17} /> Confirmar cierre</>)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
