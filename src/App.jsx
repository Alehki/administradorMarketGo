import React, { useState } from 'react';
import { usePedidosAdmin } from './hooks/usePedidosAdmin';
import { useProductosAdmin } from './hooks/useProductosAdmin';
import { PanelPedidos } from './componentes/PanelPedidos';
import { PanelProductos } from './componentes/PanelProductos';
import { FormularioProd } from './componentes/FormularioProd';
import './App.css';

const NOTIFICATION_SOUND = "/sounds/pedido.mp3";

export const App = () => {
  const [vistaActiva, setVistaActiva] = useState('pedidos');
  
  // Usamos nuestros custom hooks especializados
  const { pedidos, audioRef, cargarPedidos } = usePedidosAdmin();
  const { productos, cargarProductos } = useProductosAdmin();

  return (
    <div className="admin-layout">
      <audio ref={audioRef} src={NOTIFICATION_SOUND} preload="auto" />

      <aside className="admin-sidebar">
        <h2>Admin MarketGo</h2>
        <nav className="admin-nav">
          <button 
            onClick={() => setVistaActiva('productos')} 
            className={`admin-nav-btn ${vistaActiva === 'productos' ? 'active' : ''}`}
          >
            📦 Productos
          </button>
          <button 
            onClick={() => setVistaActiva('pedidos')} 
            className={`admin-nav-btn ${vistaActiva === 'pedidos' ? 'active' : ''}`}
          >
            🛒 Pedidos
          </button>
          <button 
            onClick={() => setVistaActiva('agregar')} 
            className={`admin-nav-btn ${vistaActiva === 'agregar' ? 'active' : ''}`}
          >
            ➕ Agregar producto
          </button>
        </nav>
      </aside>

      <main className="admin-content">
        {vistaActiva === 'productos' && (
          <PanelProductos productos={productos} onRecargar={cargarProductos} />
        )}
        {vistaActiva === 'agregar' && (
          <FormularioProd 
            onCreado={() => setVistaActiva('productos')} 
            onRecargar={cargarProductos} 
          />
        )}
        {vistaActiva === 'pedidos' && (
          <PanelPedidos pedidos={pedidos} onActualizar={cargarPedidos} />
        )}
      </main>
    </div>
  );
};