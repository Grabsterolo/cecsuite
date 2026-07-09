import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell, FileText, CalendarDays, CalendarCheck, CalendarRange, User, LogOut,
  Home, ChevronRight, ChevronLeft, Download, Clock, Cake, Menu, X, Plus, Edit2, Trash2, AlertTriangle, ClipboardCheck, ClipboardList, Megaphone, FileUp, Users, UserPlus, KeyRound, UserX, Eye, EyeOff, MessageCircle, Send, Check, CheckCheck, Award, BarChart3, DollarSign, XCircle, Archive,
} from "lucide-react";
import { createClient as _createSupabaseClient } from "@supabase/supabase-js";
import { supabase } from "./src/lib/supabase";
import { COLORS, DEPT_COLORS, FONTS, SIDEBAR_BG } from "./src/constants/colors.js";
import { INFINITY_PATH, ROTATING_WORDS, NAV_ITEMS, VAC_TOTAL, MOTIVATIONAL_MESSAGES, TIPOS_PERMISO, TIPOS_REPORTE, RECOGNITION_CATEGORIES, CONFETTI_PARTICLES, MONTH_NAMES, DAY_NAMES } from "./src/constants/nav.js";
import { inputStyle, taStyle, btnCancelStyle, btnSubmitStyle, verTodosStyle } from "./src/styles/forms.js";
import { translateError } from "./src/utils/errors.js";
import { fmtFull, fmtSupaDate, fmtSupaShort, fmtDate, getFirstNames } from "./src/utils/format.js";
import { calcWorkDays, getEffectiveDays, isBirthdayToday, getDailyMessage } from "./src/utils/dates.js";
import { getDepartmentColor, getDepartmentTextColor } from "./src/utils/departments.js";
import { buildAudienceFilter } from "./src/utils/audience.js";
import { unlockAudio, playNotificationPing } from "./src/utils/audio.js";
import { useIsMobile } from "./src/hooks/useIsMobile.js";
import { Card, CardHeader } from "./src/components/ui/Card.jsx";
import { StatusBadge, Tag, SolicitudIcon } from "./src/components/ui/StatusBadge.jsx";
import { ModalShell } from "./src/components/ui/ModalShell.jsx";
import { ToastNotification } from "./src/components/ui/ToastNotification.jsx";
import { Logo } from "./src/components/ui/Logo.jsx";
import { DeptTag } from "./src/components/ui/DeptTag.jsx";
import { PasswordInput } from "./src/components/ui/PasswordInput.jsx";
import { VacationDonut } from "./src/components/ui/VacationDonut.jsx";
import { BirthdayConfetti } from "./src/components/ui/BirthdayConfetti.jsx";
import { DocDownloadBtn } from "./src/components/ui/DocDownloadBtn.jsx";
import { CalendarWidget } from "./src/components/ui/CalendarWidget.jsx";
import { LoginScreen } from "./src/components/auth/LoginScreen.jsx";
import { Sidebar, MobileDrawer } from "./src/components/layout/Sidebar.jsx";
import { VacationForm, PermisoForm, ReporteForm, CrearSolicitudModal } from "./src/components/forms/SolicitudForms.jsx";
import { ReportPhoto, SolicitudItem } from "./src/components/ui/SolicitudItem.jsx";

import { Dashboard } from "./src/components/Dashboard.jsx";


export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out
  const [profile, setProfile] = useState(null);
  const [allRequests, setAllRequests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState([]);
  const [reports, setReports] = useState([]);
  const [adminRequests,      setAdminRequests]      = useState([]);
  const [adminReports,       setAdminReports]        = useState([]);
  const [adminAnnouncements, setAdminAnnouncements]  = useState([]);
  const [adminDocuments,     setAdminDocuments]      = useState([]);
  const [adminProfiles,      setAdminProfiles]       = useState([]);
  const [departments,        setDepartments]         = useState([]);
  const [departmentsList,    setDepartmentsList]     = useState([]);
  const [solicitudesUnread,  setSolicitudesUnread]   = useState(0);
  const [teamVacations,      setTeamVacations]       = useState([]);
  const [recognitions,       setRecognitions]        = useState([]);
  const [toast,              setToast]               = useState(null);
  const toastTimerRef = useRef(null);
  function showToast(toastObj) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(toastObj);
    toastTimerRef.current = setTimeout(() => { setToast(null); toastTimerRef.current = null; }, 5000);
  }
  const [teamDirectory,      setTeamDirectory]       = useState([]);
  const [polls,              setPolls]               = useState([]);
  const [myVotes,            setMyVotes]             = useState({});
  const [pollResults,        setPollResults]         = useState({});
  const [exchangeRate,       setExchangeRate]        = useState(null);
  const [mySales,            setMySales]            = useState([]);
  const [allSales,           setAllSales]            = useState([]);
  const [myConfirmations,    setMyConfirmations]     = useState({}); // { [document_id]: confirmed_at }
  const [allConfirmations,   setAllConfirmations]    = useState([]); // admin only
  const [myTasks,            setMyTasks]             = useState([]);
  const [myTaskCompletions,  setMyTaskCompletions]   = useState({}); // { [task_id]: completed_at }
  const [adminTasks,         setAdminTasks]          = useState([]);
  const [allTaskCompletions, setAllTaskCompletions]  = useState([]); // admin only
  const [myAttendance,       setMyAttendance]        = useState([]);
  const [adminAttendance,    setAdminAttendance]     = useState([]); // admin only
  const [attendanceSettings, setAttendanceSettings]  = useState(null); // admin only

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => setSession(s ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
      if (!s) { setProfile(null); setAllRequests([]); setAnnouncements([]); setDocuments([]); setUpcomingBirthdays([]); setReports([]); setAdminRequests([]); setAdminReports([]); setAdminAnnouncements([]); setAdminDocuments([]); setAdminProfiles([]); setDepartments([]); setDepartmentsList([]); setTeamVacations([]); setRecognitions([]); setToast(null); setTeamDirectory([]); setPolls([]); setMyVotes({}); setPollResults({}); setExchangeRate(null); setMySales([]); setAllSales([]); setMyConfirmations({}); setAllConfirmations([]); setMyTasks([]); setMyTaskCompletions({}); setAdminTasks([]); setAllTaskCompletions([]); setMyAttendance([]); setAdminAttendance([]); setAttendanceSettings(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data); });
    supabase
      .from("requests")
      .select("*, reviewer:profiles!reviewed_by(full_name)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAllRequests(data); });
    supabase
      .from("reports")
      .select("*, reviewer:profiles!reviewed_by(full_name)")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setReports(data); });
  }, [session]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from("announcements")
      .select("*")
      .lte("publish_at", new Date().toISOString())
      .or(buildAudienceFilter("audience_list", profile.departments))
      .order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAnnouncements(data); });
    supabase
      .from("documents")
      .select("*")
      .eq("archived", false)
      .or(buildAudienceFilter("departments", profile.departments))
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setDocuments(data); });
    supabase.from("document_confirmations").select("document_id, confirmed_at").eq("user_id", profile.id)
      .then(({ data }) => {
        if (!data) return;
        const map = {};
        data.forEach(c => { map[c.document_id] = c.confirmed_at; });
        setMyConfirmations(map);
      });
    (() => {
      const deptFilter = buildAudienceFilter("assigned_departments", profile.departments);
      const fullFilter = `assigned_to.eq.${profile.id},created_by.eq.${profile.id},${deptFilter}`;
      supabase.from("tasks").select("*, creator:profiles!created_by(full_name)")
        .eq("archived", false)
        .or(fullFilter)
        .order("due_date", { ascending: true, nullsFirst: false })
        .then(({ data }) => { if (data) setMyTasks(data); });
    })();
    supabase.from("task_completions").select("task_id, completed_at").eq("user_id", profile.id)
      .then(({ data }) => {
        if (!data) return;
        const map = {}; data.forEach(c => { map[c.task_id] = c.completed_at; });
        setMyTaskCompletions(map);
      });

    supabase.from("attendance_records").select("*").eq("user_id", profile.id)
      .order("clock_in", { ascending: false }).limit(30)
      .then(({ data }) => { if (data) setMyAttendance(data); });

    supabase.from("attendance_settings").select("*").eq("id", 1).single()
      .then(({ data }) => { if (data) setAttendanceSettings(data); });

    supabase.rpc("get_recognitions_feed")
      .then(({ data }) => { if (data) setRecognitions(data); });
    supabase.rpc("get_team_directory")
      .then(({ data }) => { if (data) setTeamDirectory(data); });
    (profile.role === "admin"
      ? supabase.from("polls").select("*").order("created_at", { ascending: false })
      : supabase.from("polls").select("*").or(buildAudienceFilter("audience_list", profile.departments)).order("created_at", { ascending: false })
    )
      .then(({ data }) => {
        if (!data) return;
        setPolls(data);
        data.filter(p => p.status === "activa").forEach(p => {
          supabase.rpc("get_poll_results", { poll_id_input: p.id }).then(({ data: res }) => {
            if (!res) return;
            const map = {}; res.forEach(r => { map[r.option_index] = r.votes; });
            setPollResults(prev => ({ ...prev, [p.id]: map }));
          });
        });
      });
    supabase.from("poll_votes").select("poll_id, option_index").eq("user_id", profile.id)
      .then(({ data }) => {
        if (!data) return;
        const map = {}; data.forEach(v => { map[v.poll_id] = v.option_index; });
        setMyVotes(map);
      });

    supabase.from("exchange_rate").select("*").order("updated_at", { ascending: false }).limit(1).single().then(({ data }) => { if (data) setExchangeRate(data); });
    if (profile.commission_eligible) {
      supabase.from("commission_sales").select("*").eq("user_id", profile.id).order("sale_date", { ascending: false }).then(({ data }) => { if (data) setMySales(data); });
    }
    if (profile.role === "admin") {
      supabase.from("commission_sales").select("*, profiles(full_name)").order("sale_date", { ascending: false }).then(({ data }) => { if (data) setAllSales(data); });
    }

    supabase.rpc("get_team_vacations").then(({ data }) => {
      if (data) setTeamVacations(data.map(r => ({
        start_date: r.start_date,
        end_date:   r.end_date,
        profiles: { full_name: r.full_name, department: r.department, departments: r.departments },
      })));
    });
    supabase.rpc("get_birthdays").then(({ data }) => {
      if (!data) return;
      const today = new Date(); today.setHours(0,0,0,0);
      const processed = data.map(p => {
        const bd = new Date(p.birth_date + "T12:00:00");
        let next = new Date(today.getFullYear(), bd.getMonth(), bd.getDate());
        if (next < today) next = new Date(today.getFullYear() + 1, bd.getMonth(), bd.getDate());
        const shortDate = `${next.getDate()} ${MONTH_NAMES[next.getMonth()].slice(0,3).toLowerCase()}`;
        return { full_name: p.full_name, date: shortDate, _next: next };
      });
      processed.sort((a, b) => a._next - b._next);
      setUpcomingBirthdays(processed.slice(0, 5).map(({ full_name, date }) => ({ full_name, date })));
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== "admin") return;
    supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminRequests(data); });
    supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminReports(data);
      });
    supabase.from("announcements").select("*, profiles!announcements_created_by_fkey(full_name)").order("publish_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminAnnouncements(data); });
    supabase.from("documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminDocuments(data); });
    supabase.from("document_confirmations").select("document_id, user_id, confirmed_at, profiles(full_name)")
      .then(({ data }) => { if (data) setAllConfirmations(data); });
    supabase.from("profiles").select("*").order("full_name", { ascending: true })
      .then(({ data }) => {
        if (!data) return;
        setAdminProfiles(data);
        const unique = [...new Set(data.map(p => p.department).filter(Boolean))].sort();
        setDepartments(unique);
      });
    supabase.from("departments").select("*").order("name")
      .then(({ data }) => { if (data) setDepartmentsList(data); });
    supabase.from("tasks").select("*, creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)")
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAdminTasks(data); });
    supabase.from("task_completions").select("task_id, user_id, completed_at, profiles(full_name)")
      .then(({ data }) => { if (data) setAllTaskCompletions(data); });
    (() => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      supabase.from("attendance_records").select("*, profiles!attendance_records_user_id_fkey(full_name, departments, expected_shift_start)")
        .gte("clock_in", since)
        .order("clock_in", { ascending: false })
        .then(({ data }) => { if (data) setAdminAttendance(data); });
    })();
  }, [profile]);

  // Unlock AudioContext on first user interaction so it's ready when Realtime fires
  useEffect(() => {
    document.addEventListener("click", unlockAudio, { once: true });
    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  // ── Realtime subscriptions ──
  useEffect(() => {
    if (!profile || !session?.user) return;

    const userId    = session.user.id;
    const isAdmin   = profile.role === "admin";
    const userDepts = Array.isArray(profile.departments) ? profile.departments : [];

    function audienceMatch(list) {
      if (!Array.isArray(list)) return false;
      return list.includes("todos") || userDepts.some(d => list.includes(d));
    }
    function deptsMatch(list) {
      if (!Array.isArray(list)) return false;
      return list.includes("todos") || userDepts.some(d => list.includes(d));
    }

    const ch = supabase.channel("portal-realtime-" + userId);

    // ── announcements ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "announcements" }, ({ new: row }) => {
      if (new Date(row.publish_at) > new Date()) return;
      if (audienceMatch(row.audience_list)) {
        setAnnouncements(prev => prev.some(a => a.id === row.id) ? prev : [row, ...prev]);
        playNotificationPing();
        showToast({ message: `Nuevo comunicado: ${row.title}`, Icon: Bell });
      }
      if (isAdmin) {
        supabase.from("announcements").select("*, profiles!announcements_created_by_fkey(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminAnnouncements(prev => prev.some(a => a.id === data.id) ? prev : [data, ...prev]); });
      }
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "announcements" }, ({ new: row }) => {
      setAnnouncements(prev => prev.map(a => a.id === row.id ? { ...a, ...row } : a));
      if (isAdmin) setAdminAnnouncements(prev => prev.map(a => a.id === row.id ? { ...a, ...row } : a));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "announcements" }, ({ old: row }) => {
      setAnnouncements(prev => prev.filter(a => a.id !== row.id));
      if (isAdmin) setAdminAnnouncements(prev => prev.filter(a => a.id !== row.id));
    });

    // ── documents ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "documents" }, ({ new: row }) => {
      if (deptsMatch(row.departments)) {
        setDocuments(prev => prev.some(d => d.id === row.id) ? prev : [row, ...prev]);
      }
      if (isAdmin) setAdminDocuments(prev => prev.some(d => d.id === row.id) ? prev : [row, ...prev]);
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "documents" }, ({ new: row }) => {
      setDocuments(prev => prev.map(d => d.id === row.id ? { ...d, ...row } : d));
      if (isAdmin) setAdminDocuments(prev => prev.map(d => d.id === row.id ? { ...d, ...row } : d));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "documents" }, ({ old: row }) => {
      setDocuments(prev => prev.filter(d => d.id !== row.id));
      if (isAdmin) setAdminDocuments(prev => prev.filter(d => d.id !== row.id));
    });

    // ── tasks ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "tasks" }, ({ new: row }) => {
      const mineMatch = !row.archived && (row.assigned_to === userId || row.created_by === userId || deptsMatch(row.assigned_departments));
      if (!mineMatch && !isAdmin) return;
      supabase.from("tasks").select("*, creator:profiles!created_by(full_name), assignee:profiles!assigned_to(full_name)").eq("id", row.id).single()
        .then(({ data }) => {
          if (!data) return;
          if (mineMatch) {
            setMyTasks(prev => prev.some(t => t.id === data.id) ? prev.map(t => t.id === data.id ? data : t) : [data, ...prev]);
            if (row.created_by !== userId) {
              playNotificationPing();
              showToast({ message: `Nueva tarea asignada: ${row.title}`, Icon: ClipboardList });
            }
          }
          if (isAdmin) setAdminTasks(prev => prev.some(t => t.id === data.id) ? prev.map(t => t.id === data.id ? data : t) : [data, ...prev]);
        });
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "tasks" }, ({ new: row }) => {
      setMyTasks(prev => prev.map(t => t.id === row.id ? { ...t, ...row } : t));
      if (isAdmin) setAdminTasks(prev => prev.map(t => t.id === row.id ? { ...t, ...row } : t));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "tasks" }, ({ old: row }) => {
      setMyTasks(prev => prev.filter(t => t.id !== row.id));
      if (isAdmin) setAdminTasks(prev => prev.filter(t => t.id !== row.id));
    });

    // ── task_completions ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "task_completions" }, ({ new: row }) => {
      if (row.user_id === userId) setMyTaskCompletions(prev => ({ ...prev, [row.task_id]: row.completed_at }));
      if (isAdmin) {
        supabase.from("task_completions").select("task_id, user_id, completed_at, profiles(full_name)").eq("task_id", row.task_id).eq("user_id", row.user_id).single()
          .then(({ data }) => { if (data) setAllTaskCompletions(prev => prev.some(c => c.task_id === data.task_id && c.user_id === data.user_id) ? prev : [...prev, data]); });
      }
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "task_completions" }, ({ old: row }) => {
      if (row.user_id === userId) setMyTaskCompletions(prev => { const n = { ...prev }; delete n[row.task_id]; return n; });
      if (isAdmin) setAllTaskCompletions(prev => prev.filter(c => !(c.task_id === row.task_id && c.user_id === row.user_id)));
    });

    // ── employee's own requests/reports: status updates ──
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests", filter: `user_id=eq.${userId}` }, ({ new: row, old: oldRow }) => {
      const prevWasPending = !oldRow?.status || oldRow.status === "pendiente";
      if (!isAdmin && prevWasPending && row.status !== "pendiente") {
        playNotificationPing(); // sound first, state update follows in the same microtask batch
        setSolicitudesUnread(n => n + 1);
      }
      setAllRequests(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports", filter: `user_id=eq.${userId}` }, ({ new: row, old: oldRow }) => {
      const prevWasPending = !oldRow?.status || oldRow.status === "pendiente";
      if (!isAdmin && prevWasPending && row.status !== "pendiente") {
        playNotificationPing();
        setSolicitudesUnread(n => n + 1);
      }
      setReports(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
    });

    // ── admin: all requests & reports ──
    if (isAdmin) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "requests" }, ({ new: row }) => {
        if (row.status === "pendiente" && row.user_id !== userId) playNotificationPing();
        supabase.from("requests").select("*, profiles!requests_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminRequests(prev => prev.some(r => r.id === data.id) ? prev : [data, ...prev]); });
      });
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests" }, ({ new: row }) => {
        setAdminRequests(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
      });
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "requests" }, ({ old: row }) => {
        setAdminRequests(prev => prev.filter(r => r.id !== row.id));
      });
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "reports" }, ({ new: row }) => {
        if (row.status === "pendiente" && row.user_id !== userId) playNotificationPing();
        supabase.from("reports").select("*, profiles!reports_user_id_fkey(full_name, department), reviewer:profiles!reviewed_by(full_name)").eq("id", row.id).single()
          .then(({ data }) => { if (data) setAdminReports(prev => prev.some(r => r.id === data.id) ? prev : [data, ...prev]); });
      });
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "reports" }, ({ new: row }) => {
        setAdminReports(prev => prev.map(r => r.id === row.id ? { ...r, ...row } : r));
      });
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "reports" }, ({ old: row }) => {
        setAdminReports(prev => prev.filter(r => r.id !== row.id));
      });
    }

    // ── team vacation calendar: refresh when any vacation changes approval ──
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "requests" }, ({ new: row }) => {
      if (row.type === "vacaciones") {
        supabase.rpc("get_team_vacations").then(({ data }) => {
          if (data) setTeamVacations(data.map(r => ({
            start_date: r.start_date,
            end_date:   r.end_date,
            profiles: { full_name: r.full_name, department: r.department, departments: r.departments },
          })));
        });
      }
    });

    // ── recognitions: new entry ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "recognitions" }, ({ new: row }) => {
      supabase.rpc("get_recognitions_feed").then(({ data }) => {
        if (!data) return;
        setRecognitions(data);
        const added = data.find(r => r.id === row.id);
        if (added && added.to_user_id === session?.user?.id) {
          playNotificationPing();
          showToast({ message: `¡${added.from_name ?? "Un compañero"} te reconoció por ${added.category}!`, Icon: Award });
        }
      });
    });

    // ── recognitions: deleted by admin ──
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "recognitions" }, ({ old: row }) => {
      setRecognitions(prev => prev.filter(r => r.id !== row.id));
    });

    // ── polls ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "polls" }, ({ new: row }) => {
      if (!isAdmin && !audienceMatch(row.audience_list)) return;
      setPolls(prev => prev.some(p => p.id === row.id) ? prev : [row, ...prev]);
      playNotificationPing();
      showToast({ message: `Nueva encuesta: ${row.question}`, Icon: BarChart3 });
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "polls" }, ({ new: row }) => {
      setPolls(prev => prev.map(p => p.id === row.id ? { ...p, ...row } : p));
    });
    ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "polls" }, ({ old: row }) => {
      setPolls(prev => prev.filter(p => p.id !== row.id));
    });

    // ── poll votes: refresh results for affected poll ──
    function refreshPollResults(pollId) {
      supabase.rpc("get_poll_results", { poll_id_input: pollId }).then(({ data }) => {
        if (!data) return;
        const map = {}; data.forEach(r => { map[r.option_index] = r.votes; });
        setPollResults(prev => ({ ...prev, [pollId]: map }));
      });
    }
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "poll_votes" }, ({ new: row }) => {
      refreshPollResults(row.poll_id);
    });
    ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "poll_votes" }, ({ new: row }) => {
      refreshPollResults(row.poll_id);
    });

    // ── commission_sales realtime ──
    if (isAdmin) {
      const refreshAllSales = () => supabase.from("commission_sales").select("*, profiles(full_name)").order("sale_date", { ascending: false }).then(({ data }) => { if (data) setAllSales(data); });
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "commission_sales" }, refreshAllSales);
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "commission_sales" }, refreshAllSales);
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "commission_sales" }, refreshAllSales);
    } else if (profile.commission_eligible) {
      ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ new: row }) => setMySales(prev => prev.some(s => s.id === row.id) ? prev : [row, ...prev]));
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ new: row }) => setMySales(prev => prev.map(s => s.id === row.id ? { ...s, ...row } : s)));
      ch.on("postgres_changes", { event: "DELETE", schema: "public", table: "commission_sales", filter: `user_id=eq.${userId}` }, ({ old: row }) => setMySales(prev => prev.filter(s => s.id !== row.id)));
    }
    if (isAdmin || profile.commission_eligible) {
      ch.on("postgres_changes", { event: "UPDATE", schema: "public", table: "exchange_rate" }, ({ new: row }) => setExchangeRate(row));
    }

    // ── document confirmations ──
    ch.on("postgres_changes", { event: "INSERT", schema: "public", table: "document_confirmations" }, ({ new: row }) => {
      if (row.user_id === userId) {
        setMyConfirmations(prev => ({ ...prev, [row.document_id]: row.confirmed_at }));
      }
      if (isAdmin) {
        supabase.from("document_confirmations").select("document_id, user_id, confirmed_at, profiles(full_name)").eq("document_id", row.document_id).eq("user_id", row.user_id).single()
          .then(({ data }) => { if (data) setAllConfirmations(prev => prev.some(c => c.document_id === data.document_id && c.user_id === data.user_id) ? prev : [...prev, data]); });
      }
    });

    ch.subscribe();
    return () => { ch.unsubscribe(); supabase.removeChannel(ch); };
  }, [profile, session]);

  if (session === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.bg, fontFamily: "'Manrope', sans-serif", color: COLORS.textMuted, fontSize: 14 }}>
        Cargando...
      </div>
    );
  }

  if (session && profile?.role === "inactivo") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:COLORS.bg, fontFamily:"'Manrope', sans-serif" }}>
        <style>{FONTS}</style>
        <div style={{ textAlign:"center", padding:32, maxWidth:400 }}>
          <p style={{ color:"#c0392b", fontSize:15, fontWeight:700, marginBottom:8 }}>Tu cuenta ha sido desactivada.</p>
          <p style={{ color:COLORS.textMuted, fontSize:13, marginBottom:24 }}>Contacta a administración para más información.</p>
          <button onClick={() => supabase.auth.signOut()} style={{
            background:"transparent", border:`1.5px solid ${COLORS.border}`,
            color:COLORS.textMuted, cursor:"pointer", borderRadius:8,
            padding:"8px 20px", fontSize:13, fontFamily:"'Manrope', sans-serif",
            transition:"all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor=COLORS.primary; e.currentTarget.style.color=COLORS.primary; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=COLORS.border; e.currentTarget.style.color=COLORS.textMuted; }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  const recognitionsUnread = session?.user
    ? recognitions.filter(r => r.to_user_id === session.user.id && !r.read_by_recipient).length
    : 0;

  function markRecognitionsRead() {
    if (!session?.user?.id) return;
    const uid = session.user.id;
    // No .eq("read_by_recipient", false) filter: PostgreSQL "= false" skips NULL rows.
    // Remove the filter so rows with NULL (missing DEFAULT false) are also marked read.
    supabase.from("recognitions").update({ read_by_recipient: true }).eq("to_user_id", uid);
    setRecognitions(prev => prev.map(r =>
      r.to_user_id === uid && !r.read_by_recipient ? { ...r, read_by_recipient: true } : r
    ));
  }

  return (
    <div>
      <style>{FONTS}</style>
      {session
        ? <Dashboard
            onLogout={() => supabase.auth.signOut()}
            profile={profile}
            allRequests={allRequests}
            onNewRequest={r => setAllRequests(prev => [r, ...prev])}
            onDeleteRequest={id => setAllRequests(prev => prev.filter(r => r.id !== id))}
            reports={reports}
            onNewReport={r => setReports(prev => [r, ...prev])}
            onDeleteReport={id => setReports(prev => prev.filter(r => r.id !== id))}
            announcements={announcements}
            documents={documents}
            upcomingBirthdays={upcomingBirthdays}
            adminRequests={adminRequests}
            adminReports={adminReports}
            onUpdateAdminRequest={(id, changes) => { setAdminRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r)); setAllRequests(prev => prev.map(r => r.id === id ? { ...r, ...changes } : r)); }}
            onUpdateAdminReport={(id, changes)  => setAdminReports(prev  => prev.map(r => r.id === id ? { ...r, ...changes } : r))}
            onDeleteAdminRequest={id => { setAdminRequests(prev => prev.filter(r => r.id !== id)); setAllRequests(prev => prev.filter(r => r.id !== id)); }}
            onVacationCancelled={(uid, exactBalance) => { if (uid === profile?.id) setProfile(prev => ({ ...prev, vacation_balance: exactBalance })); }}
            adminAnnouncements={adminAnnouncements}
            onNewAnnouncement={a => setAdminAnnouncements(prev => [a, ...prev])}
            onDeleteAnnouncement={id => { setAnnouncements(prev => prev.filter(a => a.id !== id)); setAdminAnnouncements(prev => prev.filter(a => a.id !== id)); }}
            adminDocuments={adminDocuments}
            onNewDocument={d => setAdminDocuments(prev => [d, ...prev])}
            onDeleteDocument={id => setAdminDocuments(prev => prev.filter(d => d.id !== id))}
            onUpdateAdminDocument={d => setAdminDocuments(prev => prev.map(x => x.id === d.id ? d : x))}
            adminProfiles={adminProfiles}
            departments={departments}
            departmentsList={departmentsList}
            onUpdateAdminProfile={updatedEmp => setAdminProfiles(prev => prev.map(p => p.id === updatedEmp.id ? updatedEmp : p))}
            userId={session?.user?.id}
            solicitudesUnread={solicitudesUnread}
            onClearSolicitudesUnread={() => setSolicitudesUnread(0)}
            teamVacations={teamVacations}
            recognitions={recognitions}
            onNewRecognition={r => setRecognitions(prev => prev.some(x => x.id === r.id) ? prev : [r, ...prev])}
            onDeleteRecognition={id => setRecognitions(prev => prev.filter(r => r.id !== id))}
            teamDirectory={teamDirectory}
            recognitionsUnread={recognitionsUnread}
            onMarkRecognitionsRead={markRecognitionsRead}
            polls={polls}
            myVotes={myVotes}
            pollResults={pollResults}
            onVoted={(pollId, idx) => setMyVotes(prev => ({ ...prev, [pollId]: idx }))}
            onPollCreated={p => setPolls(prev => prev.some(x => x.id === p.id) ? prev : [p, ...prev])}
            onPollClosed={id => setPolls(prev => prev.map(p => p.id === id ? { ...p, status: "cerrada" } : p))}
            onPollDeleted={id => setPolls(prev => prev.filter(p => p.id !== id))}
            exchangeRate={exchangeRate}
            mySales={mySales}
            allSales={allSales}
            onExchangeRateUpdated={r => setExchangeRate(r)}
            onSaleDeleted={id => setMySales(prev => prev.filter(s => s.id !== id))}
            showToast={showToast}
            onAliasUpdated={alias => setProfile(prev => ({ ...prev, alias }))}
            myConfirmations={myConfirmations}
            allConfirmations={allConfirmations}
            onConfirmRead={(docId, confirmedAt) => setMyConfirmations(prev => ({ ...prev, [docId]: confirmedAt }))}
            onNewConfirmation={c => setAllConfirmations(prev => prev.some(x => x.document_id === c.document_id && x.user_id === c.user_id) ? prev : [...prev, c])}
            myTasks={myTasks}
            myTaskCompletions={myTaskCompletions}
            adminTasks={adminTasks}
            allTaskCompletions={allTaskCompletions}
            onNewTask={t => {
              const userDepts = Array.isArray(profile?.departments) ? profile.departments : [];
              const matchesMe = t.assigned_to === profile?.id || t.created_by === profile?.id ||
                (Array.isArray(t.assigned_departments) && (t.assigned_departments.includes("todos") || userDepts.some(d => t.assigned_departments.includes(d))));
              if (matchesMe) setMyTasks(prev => prev.some(x => x.id === t.id) ? prev : [t, ...prev]);
              if (profile?.role === "admin") setAdminTasks(prev => prev.some(x => x.id === t.id) ? prev : [t, ...prev]);
            }}
            onDeleteTask={id => { setMyTasks(prev => prev.filter(t => t.id !== id)); setAdminTasks(prev => prev.filter(t => t.id !== id)); }}
            onUpdateTask={t => { setMyTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)); setAdminTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)); }}
            onTaskCompleted={(taskId, completedAt) => {
              setMyTaskCompletions(prev => ({ ...prev, [taskId]: completedAt }));
              setAllTaskCompletions(prev => prev.some(c => c.task_id === taskId && c.user_id === profile?.id) ? prev : [...prev, { task_id: taskId, user_id: profile?.id, completed_at: completedAt, profiles: { full_name: profile?.full_name } }]);
            }}
            onTaskUncompleted={taskId => {
              setMyTaskCompletions(prev => { const n = { ...prev }; delete n[taskId]; return n; });
              setAllTaskCompletions(prev => prev.filter(c => !(c.task_id === taskId && c.user_id === profile?.id)));
            }}
            myAttendance={myAttendance}
            adminAttendance={adminAttendance}
            attendanceSettings={attendanceSettings}
            onClockIn={record => {
              setMyAttendance(prev => [record, ...prev]);
              if (profile?.role === "admin") {
                setAdminAttendance(prev => [{ ...record, profiles: { full_name: profile?.full_name, departments: profile?.departments, expected_shift_start: profile?.expected_shift_start } }, ...prev]);
              }
            }}
            onClockOut={record => {
              setMyAttendance(prev => prev.map(r => r.id === record.id ? record : r));
              setAdminAttendance(prev => prev.map(r => r.id === record.id ? { ...r, ...record } : r));
            }}
            onUpdateAttendanceRecord={record => {
              setAdminAttendance(prev => prev.map(r => r.id === record.id ? record : r));
              setMyAttendance(prev => prev.map(r => r.id === record.id ? record : r));
            }}
            onSettingsUpdated={settings => setAttendanceSettings(settings)}
          />
        : <LoginScreen onLogin={() => {}} />
      }
      <ToastNotification toast={toast} />
    </div>
  );
}

