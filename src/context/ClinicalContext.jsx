import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

const CLINICAL_ROLES = ["admin", "doctor", "recepcion"];

// Replica en el cliente la misma condición que public.is_clinical_staff() aplica
// en las políticas RLS, para decidir qué renderizar sin ida y vuelta de red.
// La seguridad real la sigue imponiendo RLS en Supabase, no esta función.
export function hasClinicalAccess(profile) {
  return CLINICAL_ROLES.includes(profile?.role);
}

const ClinicalContext = createContext(null);

function startOfTodayISO() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

// Reutilizado tanto en el fetch inicial como al re-consultar una cita puntual
// tras un INSERT por realtime, para que siempre traiga los mismos datos anidados.
const APPOINTMENT_SELECT = "*, patient:patients(full_name, phone, allergies), doctor:profiles!appointments_doctor_id_fkey(full_name)";

export function ClinicalProvider({ userId, profile, children }) {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]); // hoy + próximas
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const canAccess = !!userId && hasClinicalAccess(profile);

  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;
    setLoading(true);

    Promise.all([
      supabase.from("patients").select("*").eq("active", true).order("full_name", { ascending: true }),
      supabase.from("appointments").select(APPOINTMENT_SELECT).gte("scheduled_at", startOfTodayISO()).order("scheduled_at", { ascending: true }),
      supabase.from("profiles").select("id, full_name").eq("role", "doctor").order("full_name", { ascending: true }),
    ]).then(([patientsRes, appointmentsRes, doctorsRes]) => {
      if (cancelled) return;
      if (patientsRes.data) setPatients(patientsRes.data);
      if (appointmentsRes.data) setAppointments(appointmentsRes.data);
      if (doctorsRes.data) setDoctors(doctorsRes.data);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [canAccess, userId]);

  useEffect(() => {
    if (!canAccess) return;

    const ch = supabase.channel("clinical-realtime-" + userId);

    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "patients" }, ({ new: row }) => {
      setPatients(prev => prev.some(p => p.id === row.id) ? prev : [row, ...prev]);
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "patients" }, ({ new: row }) => {
      setPatients(prev => prev.map(p => p.id === row.id ? { ...p, ...row } : p));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "patients" }, ({ old: row }) => {
      setPatients(prev => prev.filter(p => p.id !== row.id));
    });

    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "appointments" }, ({ new: row }) => {
      // postgres_changes solo manda las columnas crudas; volvemos a pedir la fila
      // con los joins para que patient/doctor no falten en la cita recién creada.
      supabase.from("appointments").select(APPOINTMENT_SELECT).eq("id", row.id).single().then(({ data }) => {
        const fullRow = data ?? row;
        setAppointments(prev => prev.some(a => a.id === fullRow.id)
          ? prev
          : [...prev, fullRow].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)));
      });
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "appointments" }, ({ new: row }) => {
      setAppointments(prev => prev.map(a => a.id === row.id ? { ...a, ...row } : a));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "appointments" }, ({ old: row }) => {
      setAppointments(prev => prev.filter(a => a.id !== row.id));
    });

    ch.subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [canAccess, userId]);

  const value = { patients, appointments, doctors, loading: canAccess ? loading : false };
  return <ClinicalContext.Provider value={value}>{children}</ClinicalContext.Provider>;
}

export function useClinical() {
  const ctx = useContext(ClinicalContext);
  if (!ctx) throw new Error("useClinical debe usarse dentro de <ClinicalProvider>");
  return ctx;
}
