export const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const formatDateLong = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const s = date.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatDateShort = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const s = date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const formatMoney = (n) => {
  const val = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
};

export const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

export const dateKeyFromIso = (iso) => {
  try {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch (e) {
    return null;
  }
};

export const formatDateTimeShort = (iso) => {
  try {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    return `${dd}/${mm} ${hh}`;
  } catch (e) {
    return '';
  }
};

export const uid = () => Math.random().toString(36).slice(2, 10);

export function itemNumbers(item) {
  const pct = item.profitPercentAtSale || 0;
  // pct es el % de ganancia sobre el COSTO (ej: costo 100 + 30% = precio 130).
  // reposicion (costo) = precio / (1 + pct/100); ganancia = precio - reposicion.
  const reposicion = item.price / (1 + pct / 100);
  const ganancia = item.price - reposicion;
  return { ganancia, reposicion };
}

export function saleTotal(sale) {
  return (sale.items || []).reduce((acc, it) => acc + it.price, 0);
}

export function summarizeSales(sales) {
  let total = 0, gananciaTotal = 0, reposicionTotal = 0;
  const byType = {};
  const byPayment = { efectivo: 0, mp: 0 };
  (sales || []).forEach((sale) => {
    if (sale.paymentMethod === 'mixto') {
      byPayment.efectivo += Number(sale.cashAmount) || 0;
      byPayment.mp += Number(sale.mpAmount) || 0;
    } else {
      const method = sale.paymentMethod === 'mp' ? 'mp' : 'efectivo';
      byPayment[method] += saleTotal(sale);
    }
    (sale.items || []).forEach((item) => {
      const { ganancia, reposicion } = itemNumbers(item);
      total += item.price;
      gananciaTotal += ganancia;
      reposicionTotal += reposicion;
      const key = item.productId || item.productName;
      if (!byType[key]) byType[key] = { name: item.productName, total: 0, ganancia: 0, reposicion: 0, count: 0 };
      byType[key].total += item.price;
      byType[key].ganancia += ganancia;
      byType[key].reposicion += reposicion;
      byType[key].count += 1;
    });
  });
  return { total, gananciaTotal, reposicionTotal, byType, byPayment };
}
