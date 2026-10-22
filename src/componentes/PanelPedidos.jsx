import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './PanelPedidos.css';

// Secuencia exacta de estados como en tu versión anterior
const ESTADOS = ["recibido", "preparando", "en_camino", "entregado"];

const LABELS = {
  recibido: "Pedido recibido",
  preparando: "Preparando",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
  rechazado: "Rechazado"
};

const TEXTOS_BOTON = {
  recibido: "Comenzar preparación",
  preparando: "Enviar pedido",
  en_camino: "Marcar entregado"
};

export const PanelPedidos = ({ pedidos = [], onActualizar }) => {
  const [filtroEstado, setFiltroEstado] = useState('recibido');

  const handleCambiarEstado = async (pedidoId, estadoActual) => {
    const index = ESTADOS.indexOf(estadoActual);
    if (index === -1 || index >= ESTADOS.length - 1) return;

    const siguienteEstado = ESTADOS[index + 1];

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ estado: siguienteEstado })
        .eq("id", pedidoId);

      if (error) throw error;
      if (onActualizar) onActualizar();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  // Normalizamos el estado por si viene como 'pendiente' o 'nuevo' de la base de datos vieja
  const normalizarEstado = (est) => {
    if (est === 'pendiente' || est === 'nuevo') return 'recibido';
    if (est === 'listo') return 'en_camino'; // Si usabas 'listo', lo mapeamos a en_camino o como prefieras
    return est || 'recibido';
  };

  // Filtrar pedidos según la pestaña activa
  const pedidosFiltrados = pedidos.filter(p => {
    const estado = normalizarEstado(p.estado);
    if (filtroEstado === 'cancelado') return p.estado === 'cancelado' || p.estado === 'rechazado';
    return estado === filtroEstado;
  });

  // Contadores para las pestañas
  const contar = (est) => pedidos.filter(p => {
    const estado = normalizarEstado(p.estado);
    if (est === 'cancelado') return p.estado === 'cancelado' || p.estado === 'rechazado';
    return estado === est;
  }).length;

  return (
    <section>
      <h1>Panel Operativo de Pedidos</h1>

      {/* PESTAÑAS DE FILTRADO */}
      <div className="pedidos-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <button 
          className={`tab-btn ${filtroEstado === 'recibido' ? 'active' : ''}`} 
          onClick={() => setFiltroEstado('recibido')}
        >
          🚨 Recibidos <span className="badge-count">{contar('recibido')}</span>
        </button>
        <button 
          className={`tab-btn ${filtroEstado === 'preparando' ? 'active' : ''}`} 
          onClick={() => setFiltroEstado('preparando')}
        >
          👨‍🍳 Preparando <span className="badge-count">{contar('preparando')}</span>
        </button>
        <button 
          className={`tab-btn ${filtroEstado === 'en_camino' ? 'active' : ''}`} 
          onClick={() => setFiltroEstado('en_camino')}
        >
          🚚 En Camino <span className="badge-count">{contar('en_camino')}</span>
        </button>
        <button 
          className={`tab-btn ${filtroEstado === 'entregado' ? 'active' : ''}`} 
          onClick={() => setFiltroEstado('entregado')}
        >
          ✅ Entregados <span className="badge-count">{contar('entregado')}</span>
        </button>
        <button 
          className={`tab-btn ${filtroEstado === 'cancelado' ? 'active' : ''}`} 
          onClick={() => setFiltroEstado('cancelado')}
        >
          ❌ Cancelados <span className="badge-count">{contar('cancelado')}</span>
        </button>
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="pedidos-list">
        {pedidosFiltrados.length === 0 ? (
          <p className="no-pedidos">No hay pedidos en esta sección.</p>
        ) : (
          pedidosFiltrados.map((p) => {
            const estadoActual = normalizarEstado(p.estado);
            const index = ESTADOS.indexOf(estadoActual);
            const esUltimo = index === ESTADOS.length - 1;
            const siguienteEstado = !esUltimo ? ESTADOS[index + 1] : null;

            return (
              <div key={p.id} className={`pedido-card estado-${estadoActual}`}>
                <div className="pedido-header">
                  <div>
                    <h3>Pedido #{p.id.slice(0, 8)}</h3>
                    <span className="pedido-fecha">{new Date(p.created_at).toLocaleString()}</span>
                  </div>
                  <span className={`pedido-badge ${estadoActual}`}>
                    {LABELS[estadoActual] || estadoActual}
                  </span>
                </div>

                <div className="pedido-info-grid">
                  <div>
                    <p>📍 <strong>Dirección:</strong> {p.direccion || "Sin dirección"}</p>
                    <p>📝 <strong>Ref:</strong> {p.referencia || 'Ninguna'}</p>
                  </div>
                  <div>
                    <p>💳 <strong>Pago:</strong> {p.metodo_pago || "No especificado"}</p>
                    <p>💰 <strong>Total:</strong> ${p.total}</p>
                  </div>
                </div>

                <div className="pedido-items-section">
                  <strong>Productos:</strong>
                  <ul>
                    {(p.pedido_items || []).map(item => (
                      <li key={item.id}>{item.cantidad}x {item.nombre} {item.color ? `(${item.color})` : ''}</li>
                    ))}
                  </ul>
                </div>

                <div className="pedido-footer">
                  {esUltimo || p.estado === 'cancelado' || p.estado === 'rechazado' ? (
                    <span className="estado-ok">✔ {LABELS[p.estado] || "Finalizado"}</span>
                  ) : (
                    <button 
                      onClick={() => handleCambiarEstado(p.id, estadoActual)} 
                      className="btn-accion-verde"
                    >
                      {TEXTOS_BOTON[siguienteEstado] || "Avanzar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};