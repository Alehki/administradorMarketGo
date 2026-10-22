import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './PanelProductos.css';

export const PanelProductos = ({ productos, onRecargar }) => {
  const [busqueda, setBusqueda] = useState('');

  const handleGuardarInline = async (id, precio, stock, activo) => {
    const { error } = await supabase
      .from("productos")
      .update({ precio: Number(precio), stock: Number(stock), activo })
      .eq("id", id);

    if (error) {
      alert("Error al actualizar producto");
    } else {
      onRecargar();
    }
  };

  // Filtrar productos por nombre o categoría en tiempo real
  const productosFiltrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.categoria && p.categoria.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <section>
      <div className="productos-header-admin">
        <h1>Inventario de Productos</h1>
        {/* BUSCADOR EXPRESS */}
        <input 
          type="text" 
          placeholder="Buscar por nombre o categoría..." 
          value={busqueda} 
          onChange={e => setBusqueda(e.target.value)}
          className="buscador-productos"
        />
      </div>

      <div className="productos-grid">
        {productosFiltrados.length === 0 ? (
          <p className="no-pedidos">No se encontraron productos.</p>
        ) : (
          productosFiltrados.map(p => (
            <ProductoCardItem key={p.id} producto={p} onGuardar={handleGuardarInline} />
          ))
        )}
      </div>
    </section>
  );
};

const ProductoCardItem = ({ producto, onGuardar }) => {
  const [precio, setPrecio] = useState(producto.precio);
  const [stock, setStock] = useState(producto.stock);
  const [activo, setActivo] = useState(producto.activo);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setPrecio(producto.precio);
    setStock(producto.stock ?? 0);
    setActivo(producto.activo);

    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(timer);
  }, [producto.precio, producto.stock, producto.activo]);

  return (
    <div className={`producto-card ${flash ? 'flash-verde' : ''}`}>
      <img src={producto.imagen_url || 'https://via.placeholder.com/150'} alt={producto.nombre} className="producto-img" />
      <h4>{producto.nombre}</h4>
      <span className="producto-cat">SubCategoria: {producto.subcategoria_id}</span>

      <div className="producto-inputs">
        <div>
          <label>Precio:</label>
          <input type="number" value={precio} onChange={e => setPrecio(e.target.value)} />
        </div>
        <div>
          <label>Stock:</label>
          <input type="number" value={stock} onChange={e => setStock(e.target.value)} />
        </div>
      </div>

      <div className="producto-card-footer">
        <label>
          <input type="checkbox" checked={activo} onChange={e => setActivo(e.target.checked)} /> Activo
        </label>
        <button onClick={() => onGuardar(producto.id, precio, stock, activo)} className="btn-guardar-azul">
          Guardar
        </button>
      </div>
    </div>
  );
};