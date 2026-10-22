import { supabase } from '../lib/supabaseClient';

export const adminService = {
  async obtenerPedidosConItems() {
    const { data: pedidosData, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!pedidosData || pedidosData.length === 0) return [];

    const pedidoIds = pedidosData.map(p => p.id);

    const { data: todosLosItems, error: errorItems } = await supabase
      .from("pedido_items")
      .select("*")
      .in("pedido_id", pedidoIds);

    if (errorItems) throw errorItems;

    return pedidosData.map(pedido => ({
      ...pedido,
      pedido_items: (todosLosItems || []).filter(item => item.pedido_id === pedido.id)
    }));
  },

  async obtenerProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;
    return data || [];
  }
};