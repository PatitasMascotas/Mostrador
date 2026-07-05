import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { formatMoney, formatDateShort, summarizeSales } from '../helpers';
import { loadJSON } from '../storage';

export default function HistoryRowLoader({ date, onOpen }) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let mounted = true;
    loadJSON(`day:${date}`, { date, sales: [] }).then((d) => { if (mounted) setData(d); });
    return () => { mounted = false; };
  }, [date]);

  if (!data) {
    return (
      <div className="history-row" style={{ opacity: 0.5 }}>
        <div className="history-date">{formatDateShort(date)}</div>
      </div>
    );
  }

  const { total, gananciaTotal } = summarizeSales(data.sales);

  return (
    <div className="history-row" onClick={onOpen}>
      <div>
        <div className="history-date">{formatDateShort(date)}</div>
        <div className="history-sub">{data.sales.length} venta{data.sales.length !== 1 ? 's' : ''} · ganancia {formatMoney(gananciaTotal)}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="history-amount">{formatMoney(total)}</span>
        <ChevronRight size={16} color="var(--ink-soft)" />
      </div>
    </div>
  );
}
