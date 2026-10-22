import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { adminService } from '../services/adminService';

export const useProductosAdmin = () => {
  const [productos, setProductos] = useState([]);

  const cargarProductos = useCallback(async () => {
    try {
      const data = await adminService.obtenerProductos();
      setProductos(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  }, []);

  useEffect(() => {
    cargarProductos();

    const channelProductos = supabase
      .channel("admin-productos-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, () => {
        cargarProductos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelProductos);
    };
  }, [cargarProductos]);

  return {
    productos,
    cargarProductos
  };
};