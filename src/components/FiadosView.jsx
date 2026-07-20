import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { formatMoney } from '../helpers';

function saldoDe(cliente) {
  return (cliente.movimientos || []).reduce((acc, m) => acc + (m.tipo === 'debe' ? m.monto : -m.monto), 0);
}

export default function FiadosView({ clientes, tab, onTabChange, onOpen, onNew }) {
  const [search, setSearch] = useState('');

  const conDeuda = clientes.filter((c) => saldoDe(c) > 0);
  const sinDeuda = clientes.filter((c) => saldoDe(c) <= 0);
  const base = tab === 'pendientes' ? conDeuda : sinDeuda;

  const list = search.trim()
    ? base.filter((c) => c.nombre.toLowerCase().includes(search.trim().toLowerCase()))
    : base;

  const totalPendiente = conDeuda.reduce((acc, c) => acc + saldoDe(c), 0);

  const sorted = [...list].sort((a, b) =>
    tab === 'pendientes' ? saldoDe(b) - saldoDe(a) : a.nombre.localeCompare(b.nombre)
  );

  return (
    <div>
      <div className="m-day-title hand" style={{ marginBottom: 14 }}>Fiados</div>

      {conDeuda.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <span className="m-day-total-label">Total fiado pendiente</span>
          <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: 'var(--amber)' }}>
            {formatMoney(totalPendiente)}
          </div>
        </div>
      )}

      <div className="m-nav" style={{ marginBottom: 14, width: 'fit-content' }}>
        <button className={`m-nav-btn ${tab === 'pendientes' ? 'active' : ''}`} onClick={() => onTabChange('pendientes')}>
          Con deuda {conDeuda.length > 0 ? `(${conDeuda.length})` : ''}
        </button>
        <button className={`m-nav-btn ${tab === 'saldadas' ? 'active' : ''}`} onClick={() => onTabChange('saldadas')}>
          Sin deuda
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--ink-soft)' }} />
        <input
          className="m-input"
          style={{ paddingLeft: 36, background: 'var(--counter-2)', color: 'var(--cream-text)', border: '1px solid var(--counter-3)' }}
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 10, top: 11, background: 'none', border: 'none', color: 'var(--ink-soft)', cursor: 'pointer' }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="m-empty">
          {search
            ? 'Ningún cliente coincide con esa búsqueda.'
            : tab === 'pendientes'
            ? 'No hay cuentas con deuda pendiente.'
            : 'No hay clientes sin deuda todavía.'}
        </div>
      ) : (
        sorted.map((c) => {
          const saldo = saldoDe(c);
          return (
            <div className="history-row" key={c.id} onClick={() => onOpen(c)}>
              <div>
                <div className="history-date">{c.nombre}</div>
                <div className="history-sub">
                  {(c.movimientos || []).length} movimiento{(c.movimientos || []).length !== 1 ? 's' : ''}
                </div>
              </div>
              <span className="history-amount" style={{ color: saldo > 0 ? 'var(--rust-dark)' : 'var(--green-dark)' }}>
                {saldo > 0 ? formatMoney(saldo) : 'Sin deuda'}
              </span>
            </div>
          );
        })
      )}

      <button className="m-btn m-btn-amber m-btn-block" style={{ marginTop: 12 }} onClick={onNew}>
        <Plus size={17} /> Nuevo cliente
      </button>
    </div>
  );
}
