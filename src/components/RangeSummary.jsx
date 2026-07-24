import React, { useMemo, useState } from 'react';
import { formatMoney, formatDateLong, summarizeSales } from '../helpers';

export default function RangeSummary({ desde, hasta, sales, daysWithSales }) {
  const [showByType, setShowByType] = useState(false);
  const { total, gananciaTotal, reposicionTotal, byType, byPayment } = useMemo(() => summarizeSales(sales), [sales]);
  const rows = Object.values(byType).sort((a, b) => b.reposicion - a.reposicion);

  const cantidadVentas = sales.length;
  const promedioDiario = daysWithSales > 0 ? total / daysWithSales : 0;
  const margenPct = total > 0 ? (gananciaTotal / total) * 100 : 0;

  return (
    <div className="ticket-torn">
      <div className="ticket-body">
        <div className="hand" style={{ fontSize: 19, marginBottom: 2 }}>
          {formatDateLong(desde)} — {formatDateLong(hasta)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 10 }}>
          {cantidadVentas} venta{cantidadVentas !== 1 ? 's' : ''} en {daysWithSales} día{daysWithSales !== 1 ? 's' : ''} con actividad
        </div>

        <div className="totals-strip">
          <div className="totals-box">
            <div className="tlabel">Total vendido</div>
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

        <div className="totals-strip" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div className="totals-box">
            <div className="tlabel">Promedio por día</div>
            <div className="tval">{formatMoney(promedioDiario)}</div>
          </div>
          <div className="totals-box">
            <div className="tlabel">Margen sobre ventas</div>
            <div className="tval">{margenPct.toFixed(1)}%</div>
          </div>
        </div>

        {rows.length > 0 && (
          <>
            <button
              className="m-btn m-btn-ghost m-btn-block"
              style={{ marginTop: 4, marginBottom: showByType ? 10 : 0 }}
              onClick={() => setShowByType((v) => !v)}
            >
              {showByType ? 'Ocultar reposición por tipo de producto' : 'Ver reposición por tipo de producto'}
            </button>

            {showByType && (
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
          </>
        )}
      </div>
    </div>
  );
}
