import React, { useEffect, useState } from 'react';
import { PawPrint, Plus, Package, Receipt, CalendarDays, ArrowLeft, AlertTriangle, Trash2, Pencil, LogOut, Wallet } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { loadJSON, saveJSON, removeKey, subscribeJSON } from './storage';
import { todayStr, formatDateLong } from './helpers';

import Login from './components/Login';
import DayView from './components/DayView';
import ClosingSummary from './components/ClosingSummary';
import TicketBuilder from './components/TicketBuilder';
import ProductFormModal from './components/ProductFormModal';
import HistoryRowLoader from './components/HistoryRowLoader';
import FiadosView from './components/FiadosView';
import ClienteFiadoModal from './components/ClienteFiadoModal';
import RangeSummary from './components/RangeSummary';

export default function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  if (!authChecked) {
    return (
      <div className="mostrador-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <PawPrint size={28} />
      </div>
    );
  }

  if (!user) return <Login />;

  return <Mostrador onLogout={() => signOut(auth)} />;
}

// ---------- app principal (una vez logueado) ----------

function Mostrador({ onLogout }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentDay, setCurrentDay] = useState(null); // {date, sales}
  const [daysIndex, setDaysIndex] = useState([]);

  const [view, setView] = useState('today'); // today | catalog | history | dayDetail
  const [historyDayDate, setHistoryDayDate] = useState(null);
  const [historyDayData, setHistoryDayData] = useState(null);

  const [builder, setBuilder] = useState(null); // { context: 'today'|'history', sale: null|obj }
  const [closingOpen, setClosingOpen] = useState(false);
  const [pendingResolveOpen, setPendingResolveOpen] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | {} | product
  const [finalizing, setFinalizing] = useState(false);

  const [fiadoClientes, setFiadoClientes] = useState([]);
  const [fiadoTab, setFiadoTab] = useState('pendientes'); // pendientes | saldadas
  const [fiadoModal, setFiadoModal] = useState(null); // null | {} | cliente

  const sieteDiasAtras = () => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [rangeDesde, setRangeDesde] = useState(sieteDiasAtras());
  const [rangeHasta, setRangeHasta] = useState(todayStr());
  const [rangeLoading, setRangeLoading] = useState(false);
  const [rangeSales, setRangeSales] = useState(null); // null = todavía no generado
  const [rangeDaysCount, setRangeDaysCount] = useState(0);

  // Suscripciones en tiempo real: si otro dispositivo (otra persona atendiendo
  // el local) carga o edita algo, este dispositivo lo ve reflejado enseguida.
  useEffect(() => {
    let got = { products: false, currentDay: false, daysIndex: false };
    const markReady = (key) => {
      got[key] = true;
      if (got.products && got.currentDay && got.daysIndex) setReady(true);
    };

    const unsubProducts = subscribeJSON('products', [], (val) => {
      setProducts(val);
      markReady('products');
    });
    const unsubCurrentDay = subscribeJSON('current-day', null, (val) => {
      setCurrentDay(val);
      markReady('currentDay');
    });
    const unsubDaysIndex = subscribeJSON('days-index', [], (val) => {
      setDaysIndex(val);
      markReady('daysIndex');
    });
    const unsubFiados = subscribeJSON('fiado-clientes', [], setFiadoClientes);

    return () => {
      unsubProducts();
      unsubCurrentDay();
      unsubDaysIndex();
      unsubFiados();
    };
  }, []);

  // Cuando se abre el detalle de un día del historial, se suscribe también en
  // tiempo real (por si alguien agrega/edita una venta vieja desde otro lado).
  useEffect(() => {
    if (!historyDayDate) {
      setHistoryDayData(null);
      return;
    }
    const unsub = subscribeJSON(`day:${historyDayDate}`, { date: historyDayDate, sales: [] }, setHistoryDayData);
    return unsub;
  }, [historyDayDate]);

  const today = todayStr();
  const hasPendingStaleDay = currentDay && currentDay.date !== today && currentDay.sales.length > 0;

  // ---- product CRUD ----
  const persistProducts = async (next) => {
    await saveJSON('products', next);
  };
  const saveProduct = async (data) => {
    if (productModal && productModal.id) {
      await persistProducts(products.map((p) => (p.id === productModal.id ? { ...p, ...data } : p)));
    } else {
      await persistProducts([...products, { id: uidLocal(), ...data }]);
    }
    setProductModal(null);
  };
  const deleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar este tipo de producto? Las ventas ya cargadas no se modifican.')) return;
    await persistProducts(products.filter((p) => p.id !== id));
  };

  // ---- current day sale CRUD ----
  const openNewSaleToday = () => setBuilder({ context: 'today', sale: null });
  const openEditSaleToday = (sale) => setBuilder({ context: 'today', sale });

  const saveSaleToday = async (sale) => {
    const cd = currentDay || { date: today, sales: [] };
    const exists = cd.sales.some((s) => s.id === sale.id);
    const nextSales = exists ? cd.sales.map((s) => (s.id === sale.id ? sale : s)) : [...cd.sales, sale];
    const next = { date: cd.date, sales: nextSales };
    const ok = await saveJSON('current-day', next);
    if (!ok) {
      window.alert('No se pudo guardar la venta. Revisá tu conexión y probá de nuevo.');
      return;
    }
    setBuilder(null);
  };

  const deleteSaleToday = async (saleId) => {
    if (!window.confirm('¿Eliminar esta venta?')) return;
    const next = { date: currentDay.date, sales: currentDay.sales.filter((s) => s.id !== saleId) };
    await saveJSON('current-day', next);
    setBuilder(null);
  };

  const finalizeDay = async (dayObj) => {
  setFinalizing(true);
  try {
    const existing = await loadJSON(`day:${dayObj.date}`, { date: dayObj.date, sales: [] });
    const merged = new Map();
    existing.sales.forEach((s) => merged.set(s.id, s));
    dayObj.sales.forEach((s) => merged.set(s.id, s));
    const finalDay = { date: dayObj.date, sales: Array.from(merged.values()) };

    await saveJSON(`day:${dayObj.date}`, finalDay);
    const nextIndex = Array.from(new Set([dayObj.date, ...daysIndex])).sort((a, b) => b.localeCompare(a));
    await saveJSON('days-index', nextIndex);

    setClosingOpen(false);
    setPendingResolveOpen(false);
    await removeKey('current-day');
  } finally {
    setFinalizing(false);
  }
};

  // ---- history ----
  const openHistoryDay = (date) => {
    setHistoryDayDate(date);
    setView('dayDetail');
  };

  const openNewSaleHistory = () => setBuilder({ context: 'history', sale: null });
  const openEditSaleHistory = (sale) => setBuilder({ context: 'history', sale });

  const saveSaleHistory = async (sale) => {
    const exists = historyDayData.sales.some((s) => s.id === sale.id);
    const nextSales = exists ? historyDayData.sales.map((s) => (s.id === sale.id ? sale : s)) : [...historyDayData.sales, sale];
    const next = { date: historyDayData.date, sales: nextSales };
    await saveJSON(`day:${next.date}`, next);
    setBuilder(null);
  };

  const deleteSaleHistory = async (saleId) => {
    if (!window.confirm('¿Eliminar esta venta?')) return;
    const next = { date: historyDayData.date, sales: historyDayData.sales.filter((s) => s.id !== saleId) };
    await saveJSON(`day:${next.date}`, next);
    setBuilder(null);
  };

  const generateRangeReport = async () => {
    if (!rangeDesde || !rangeHasta) return;
    setRangeLoading(true);
    try {
      const datesInRange = daysIndex.filter((d) => d >= rangeDesde && d <= rangeHasta);
      const dayDocs = await Promise.all(datesInRange.map((d) => loadJSON(`day:${d}`, { date: d, sales: [] })));
      const daysWithSales = dayDocs.filter((d) => (d.sales || []).length > 0);
      const allSales = dayDocs.flatMap((d) => d.sales || []);
      setRangeSales(allSales);
      setRangeDaysCount(daysWithSales.length);
    } finally {
      setRangeLoading(false);
    }
  };

  // ---- fiados (cuenta por cliente) ----
  const saveFiadoCliente = async (data) => {
    const exists = fiadoClientes.some((c) => c.id === data.id);
    const next = exists ? fiadoClientes.map((c) => (c.id === data.id ? data : c)) : [...fiadoClientes, data];
    setFiadoClientes(next);
    await saveJSON('fiado-clientes', next);
  };

  const deleteFiadoCliente = async (id) => {
    if (!window.confirm('¿Eliminar este cliente y todo su historial de fiado? Esta acción no se puede deshacer.')) return;
    const next = fiadoClientes.filter((c) => c.id !== id);
    setFiadoClientes(next);
    await saveJSON('fiado-clientes', next);
    setFiadoModal(null);
  };

  if (!ready) {
    return (
      <div className="mostrador-root" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', opacity: 0.7 }}>
          <PawPrint size={28} />
          <div style={{ marginTop: 8, fontSize: 13 }}>Abriendo el mostrador...</div>
        </div>
      </div>
    );
  }

  const noProducts = products.length === 0;

  return (
    <div className="mostrador-root">
      <div className="m-topbar">
        <div className="m-brand">
          <PawPrint size={20} color="var(--amber)" />
          <span className="m-brand-title">Mostrador</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="m-nav">
            <button className={`m-nav-btn ${view === 'today' ? 'active' : ''}`} onClick={() => setView('today')}>
              <Receipt size={15} /> Hoy
            </button>
            <button className={`m-nav-btn ${view === 'catalog' ? 'active' : ''}`} onClick={() => setView('catalog')}>
              <Package size={15} /> Catálogo
            </button>
            <button className={`m-nav-btn ${view === 'history' || view === 'dayDetail' || view === 'rangeReport' ? 'active' : ''}`} onClick={() => setView('history')}>
              <CalendarDays size={15} /> Historial
            </button>
            <button className={`m-nav-btn ${view === 'fiados' ? 'active' : ''}`} onClick={() => setView('fiados')}>
              <Wallet size={15} /> Fiados
            </button>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Cerrar sesión">
            <LogOut size={15} />
          </button>
        </div>
      </div>

      <div className="m-content">
        {/* ---- HOY ---- */}
        {view === 'today' && (
          <>
            {noProducts ? (
              <div className="m-empty">
                Todavía no cargaste ningún tipo de producto.<br />
                Andá a <b style={{ color: 'var(--amber)' }}>Catálogo</b> para agregar el primero antes de cargar ventas.
                <div style={{ marginTop: 16 }}>
                  <button className="m-btn m-btn-amber" onClick={() => setView('catalog')}>Ir al catálogo</button>
                </div>
              </div>
            ) : closingOpen && currentDay ? (
              <>
                <button className="back-link" onClick={() => !finalizing && setClosingOpen(false)}><ArrowLeft size={15} /> Volver</button>
                <ClosingSummary
                  date={currentDay.date}
                  sales={currentDay.sales}
                  confirmMode
                  finalizing={finalizing}
                  onCancel={() => setClosingOpen(false)}
                  onConfirm={() => finalizeDay(currentDay)}
                />
              </>
            ) : hasPendingStaleDay && !pendingResolveOpen ? (
              <div className="m-warning">
                <AlertTriangle size={20} color="var(--rust)" style={{ flexShrink: 0, marginTop: 1 }} />
                <div className="m-warning-text">
                  Tenés ventas de <b>{formatDateLong(currentDay.date)}</b> sin cerrar todavía.
                  Cerrá esa caja antes de cargar ventas de hoy.
                  <div style={{ marginTop: 10 }}>
                    <button className="m-btn m-btn-amber" onClick={() => setPendingResolveOpen(true)}>Revisar y cerrar ese día</button>
                  </div>
                </div>
              </div>
            ) : hasPendingStaleDay && pendingResolveOpen ? (
              <>
                <button className="back-link" onClick={() => setPendingResolveOpen(false)}><ArrowLeft size={15} /> Volver</button>
                <DayView
                  date={currentDay.date}
                  sales={currentDay.sales}
                  onAddSale={openNewSaleToday}
                  onEditSale={openEditSaleToday}
                  showClosingButton={true}
                  onOpenClosing={() => setClosingOpen(true)}
                  emptyHint=""
                />
              </>
            ) : (
              <DayView
                date={today}
                sales={(currentDay && currentDay.date === today) ? currentDay.sales : []}
                onAddSale={openNewSaleToday}
                onEditSale={openEditSaleToday}
                showClosingButton={true}
                onOpenClosing={() => setClosingOpen(true)}
                emptyHint="Todavía no cargaste ventas hoy. Tocá 'Nueva venta' para arrancar."
              />
            )}
          </>
        )}

        {/* ---- CATALOGO ---- */}
        {view === 'catalog' && (
          <div>
            <div className="m-day-title hand" style={{ marginBottom: 14 }}>Catálogo de productos</div>
            {products.length === 0 && <div className="m-empty">Todavía no agregaste ningún tipo de producto.</div>}
            {products.map((p) => (
              <div className="cat-row" key={p.id}>
                <div>
                  <div className="cat-name">{p.name}</div>
                  <div className="cat-pct">{p.profit}% de ganancia sobre el costo</div>
                </div>
                <div className="cat-actions">
                  <button className="icon-btn" onClick={() => setProductModal(p)}><Pencil size={16} /></button>
                  <button className="icon-btn" onClick={() => deleteProduct(p.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
            <button className="m-btn m-btn-amber m-btn-block" style={{ marginTop: 12 }} onClick={() => setProductModal({})}>
              <Plus size={17} /> Agregar tipo de producto
            </button>
          </div>
        )}

        {/* ---- HISTORIAL (lista) ---- */}
        {view === 'history' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
              <div className="m-day-title hand" style={{ marginBottom: 0 }}>Historial de días</div>
              <button className="m-btn m-btn-ghost" onClick={() => setView('rangeReport')} style={{ flexShrink: 0 }}>
                <CalendarDays size={15} /> Por rango
              </button>
            </div>
            {daysIndex.length === 0 && <div className="m-empty">Todavía no cerraste ningún día.</div>}
            {daysIndex.map((date) => (
              <HistoryRowLoader key={date} date={date} onOpen={() => openHistoryDay(date)} />
            ))}
          </div>
        )}

        {/* ---- HISTORIAL (resumen por rango de fechas) ---- */}
        {view === 'rangeReport' && (
          <div>
            <button className="back-link" onClick={() => setView('history')}><ArrowLeft size={15} /> Volver al historial</button>
            <div className="m-day-title hand" style={{ marginBottom: 14 }}>Resumen por rango de fechas</div>

            <div className="m-card">
              <div style={{ display: 'flex', gap: 10 }}>
                <div className="m-field" style={{ flex: 1, marginBottom: 10 }}>
                  <span className="m-label">Desde</span>
                  <input
                    className="m-input mono-input" type="date"
                    value={rangeDesde} onChange={(e) => setRangeDesde(e.target.value)}
                  />
                </div>
                <div className="m-field" style={{ flex: 1, marginBottom: 10 }}>
                  <span className="m-label">Hasta</span>
                  <input
                    className="m-input mono-input" type="date"
                    value={rangeHasta} onChange={(e) => setRangeHasta(e.target.value)}
                  />
                </div>
              </div>
              <button
                className="m-btn m-btn-amber m-btn-block"
                onClick={generateRangeReport}
                disabled={!rangeDesde || !rangeHasta || rangeLoading}
              >
                {rangeLoading ? 'Generando...' : 'Generar resumen'}
              </button>
            </div>

            {rangeSales !== null && (
              rangeSales.length === 0 ? (
                <div className="m-empty">No hay ventas cerradas en ese rango de fechas.</div>
              ) : (
                <RangeSummary desde={rangeDesde} hasta={rangeHasta} sales={rangeSales} daysWithSales={rangeDaysCount} />
              )
            )}
          </div>
        )}

        {/* ---- HISTORIAL (detalle de un día) ---- */}
        {view === 'dayDetail' && historyDayData && (
          <div>
            <button className="back-link" onClick={() => { setView('history'); setHistoryDayDate(null); }}><ArrowLeft size={15} /> Volver al historial</button>
            <DayView
              date={historyDayData.date}
              sales={historyDayData.sales}
              onAddSale={openNewSaleHistory}
              onEditSale={openEditSaleHistory}
              showClosingButton={false}
              emptyHint="Este día no tiene ventas cargadas."
            />
            <div style={{ marginTop: 18 }}>
              <ClosingSummary date={historyDayData.date} sales={historyDayData.sales} />
            </div>
          </div>
        )}

        {/* ---- FIADOS ---- */}
        {view === 'fiados' && (
          <FiadosView
            clientes={fiadoClientes}
            tab={fiadoTab}
            onTabChange={setFiadoTab}
            onNew={() => setFiadoModal({})}
            onOpen={(c) => setFiadoModal(c)}
          />
        )}
      </div>

      {builder && (
        <TicketBuilder
          products={products}
          initialSale={builder.sale}
          onClose={() => setBuilder(null)}
          onSave={builder.context === 'today' ? saveSaleToday : saveSaleHistory}
          onDelete={builder.context === 'today' ? deleteSaleToday : deleteSaleHistory}
        />
      )}

      {productModal && (
        <ProductFormModal
          initial={productModal.id ? productModal : null}
          onClose={() => setProductModal(null)}
          onSave={saveProduct}
        />
      )}

      {fiadoModal && (
        <ClienteFiadoModal
          initial={fiadoModal.id ? fiadoModal : null}
          onClose={() => setFiadoModal(null)}
          onSave={saveFiadoCliente}
          onDelete={deleteFiadoCliente}
        />
      )}
    </div>
  );
}

function uidLocal() {
  return Math.random().toString(36).slice(2, 10);
}
