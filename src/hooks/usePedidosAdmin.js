import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { adminService } from '../services/adminService';

// const NOTIFICATION_SOUND = `${import.meta.env.BASE_URL}sounds/pedido.mp3`;
const NOTIFICATION_SOUND = "/sounds/pedido.mp3";

export const usePedidosAdmin = () => {
  const [pedidos, setPedidos] = useState([]);
  const audioRef = useRef(null);
  const [audioHabilitado, setAudioHabilitado] = useState(false);

  // Configuración inicial del audio en el primer click global
  useEffect(() => {
    const habilitarAudio = () => {
      if (audioRef.current && !audioHabilitado) {
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          setAudioHabilitado(true);
        }).catch(() => {});
      }
    };
    window.addEventListener("click", habilitarAudio, { once: true });
    return () => window.removeEventListener("click", habilitarAudio);
  }, [audioHabilitado]);

  const cargarPedidos = useCallback(async () => {
    try {
      const data = await adminService.obtenerPedidosConItems();
      setPedidos(data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    }
  }, []);

  // Suscripción Realtime para Pedidos
  useEffect(() => {
    cargarPedidos();

    const channelPedidos = supabase
      .channel("admin-pedidos-global")
      .on("postgres_changes", { event: "*", schema: "public", table: "pedidos" }, (payload) => {
        if (payload.eventType === "INSERT") {
          if (audioRef.current) { 
            audioRef.current.currentTime = 0; 
            audioRef.current.play().catch((err) => console.log("Audio bloqueado o error:", err)); 
          }
        }
        cargarPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelPedidos);
    };
  }, [cargarPedidos]);

  return {
    pedidos,
    audioRef,
    cargarPedidos
  };
};