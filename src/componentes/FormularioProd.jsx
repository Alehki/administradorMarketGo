import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './FormularioProd.css';

export const FormularioProd = ({ onCreado, onRecargar }) => {
  const [nuevoProd, setNuevoProd] = useState({
    nombre: '', precio: '', stock: '', categoria: '', img: '', imagenes: '', colores: '', tags: '', destacado: false, activo: true
  });

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        nombre: nuevoProd.nombre,
        precio: parseFloat(nuevoProd.precio) || 0,
        stock: parseInt(nuevoProd.stock) || 0,
        categoria: nuevoProd.categoria,
        img: nuevoProd.img,
        imagenes: nuevoProd.imagenes ? nuevoProd.imagenes.split(',').map(s => s.trim()) : [],
        colores: nuevoProd.colores ? nuevoProd.colores.split(',').map(s => s.trim()) : [],
        tags: nuevoProd.tags ? nuevoProd.tags.split(',').map(s => s.trim()) : [],
        destacado: nuevoProd.destacado,
        activo: nuevoProd.activo
      };

      const { error } = await supabase.from("productos").insert([payload]);
      if (error) throw error;

      alert("¡Producto creado con éxito!");
      onRecargar();
      onCreado();
    } catch (err) {
      console.error(err);
      alert("Error al crear el producto.");
    }
  };

  return (
    <section className="form-container">
      <h1>Agregar producto</h1>
      <form onSubmit={handleCrearProducto} className="admin-form">
        <div>
          <label>Nombre</label>
          <input type="text" value={nuevoProd.nombre} onChange={e => setNuevoProd({...nuevoProd, nombre: e.target.value})} required />
        </div>
        <div className="form-row">
          <div>
            <label>Precio</label>
            <input type="number" value={nuevoProd.precio} onChange={e => setNuevoProd({...nuevoProd, precio: e.target.value})} required />
          </div>
          <div>
            <label>Stock</label>
            <input type="number" value={nuevoProd.stock} onChange={e => setNuevoProd({...nuevoProd, stock: e.target.value})} required />
          </div>
        </div>
        <div>
          <label>Categoría</label>
          <input type="text" value={nuevoProd.categoria} onChange={e => setNuevoProd({...nuevoProd, categoria: e.target.value})} required />
        </div>
        <div>
          <label>Imagen principal (URL)</label>
          <input type="text" value={nuevoProd.img} onChange={e => setNuevoProd({...nuevoProd, img: e.target.value})} />
        </div>
        <div>
          <label>Imágenes adicionales (separadas por coma)</label>
          <input type="text" value={nuevoProd.imagenes} onChange={e => setNuevoProd({...nuevoProd, imagenes: e.target.value})} />
        </div>
        <div>
          <label>Colores (separados por coma)</label>
          <input type="text" value={nuevoProd.colores} onChange={e => setNuevoProd({...nuevoProd, colores: e.target.value})} />
        </div>
        <div className="form-checkboxes">
          <label><input type="checkbox" checked={nuevoProd.destacado} onChange={e => setNuevoProd({...nuevoProd, destacado: e.target.checked})} /> Destacado</label>
          <label><input type="checkbox" checked={nuevoProd.activo} onChange={e => setNuevoProd({...nuevoProd, activo: e.target.checked})} /> Activo</label>
        </div>
        <button type="submit" className="btn-accion-verde">Guardar Producto</button>
      </form>
    </section>
  );
};