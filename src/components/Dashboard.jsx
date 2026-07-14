import React, { useState, useCallback } from "react";
import { Menu, Cake } from "lucide-react";
import { COLORS, SIDEBAR_BG } from "../constants/colors.js";
import { VAC_TOTAL, MONTH_NAMES, NAV_ITEMS_RRHH, NAV_ITEMS_CLINICO } from "../constants/nav.js";
import { fmtSupaShort, getFirstNames } from "../utils/format.js";
import { getEffectiveDays, isBirthdayToday, getDailyMessage } from "../utils/dates.js";
import { useIsMobile } from "../hooks/useIsMobile.js";
import { Logo } from "./ui/Logo.jsx";
import { BirthdayConfetti } from "./ui/BirthdayConfetti.jsx";
import { Sidebar, MobileDrawer } from "./layout/Sidebar.jsx";
import { ClinicalProvider, hasClinicalAccess } from "../context/ClinicalContext.jsx";
import { DashboardHome } from "./sections/DashboardHome.jsx";
import { DashboardClinicoHome } from "./sections/DashboardClinicoHome.jsx";
import { PacientesSection } from "./sections/PacientesSection.jsx";
import { AgendaSection } from "./sections/AgendaSection.jsx";
import { PlaceholderSection } from "./sections/PlaceholderSection.jsx";
import { ProfileSection } from "./sections/ProfileSection.jsx";
import { SolicitudesSection } from "./sections/SolicitudesSection.jsx";
import { DocumentsSection } from "./sections/DocumentsSection.jsx";
import { AnnouncementsSection } from "./sections/AnnouncementsSection.jsx";
import { RecognitionsSection } from "./sections/RecognitionsSection.jsx";
import { EncuestasSection } from "./sections/EncuestasSection.jsx";
import { TasksSection } from "./sections/TasksSection.jsx";
import { GestionTareasSection } from "./sections/GestionTareasSection.jsx";
import { AttendanceSection } from "./sections/AttendanceSection.jsx";
import { GestionAsistenciaSection } from "./sections/GestionAsistenciaSection.jsx";
import { ComisionesSection } from "./sections/ComisionesSection.jsx";
import { VacationSection } from "./sections/VacationSection.jsx";
import { EmpleadosSection, AltaEmpleadoSection } from "./sections/EmpleadosSection.jsx";
import { GestionDocumentosSection } from "./sections/GestionDocumentosSection.jsx";
import { GestionComunicadosSection } from "./sections/GestionComunicadosSection.jsx";
import { TeamCalendarSection } from "./sections/TeamCalendarSection.jsx";
import { AprobacionesSection } from "./sections/AprobacionesSection.jsx";
import { SupportChatWidget, AdminSupportChatWidget } from "./sections/SupportChatSections.jsx";

export function Dashboard({ onLogout, profile, allRequests = [], onNewRequest, onDeleteRequest, reports = [], onNewReport, onDeleteReport, announcements = [], documents = [], upcomingBirthdays = [], adminRequests = [], adminReports = [], onUpdateAdminRequest, onUpdateAdminReport, onDeleteAdminRequest, onVacationCancelled, adminAnnouncements = [], onNewAnnouncement, onDeleteAnnouncement, adminDocuments = [], onNewDocument, onDeleteDocument, onUpdateAdminDocument, adminProfiles = [], departments = [], departmentsList = [], onUpdateAdminProfile, userId, solicitudesUnread = 0, onClearSolicitudesUnread, teamVacations = [], recognitions = [], onNewRecognition, onDeleteRecognition, teamDirectory = [], recognitionsUnread = 0, onMarkRecognitionsRead, polls = [], myVotes = {}, pollResults = {}, onVoted, onPollCreated, onPollClosed, onPollDeleted, exchangeRate = null, mySales = [], allSales = [], onExchangeRateUpdated, onSaleDeleted, showToast, onAliasUpdated, myConfirmations = {}, allConfirmations = [], onConfirmRead, onNewConfirmation, myTasks = [], myTaskCompletions = {}, adminTasks = [], allTaskCompletions = [], onNewTask, onDeleteTask, onUpdateTask, onTaskCompleted, onTaskUncompleted, myAttendance = [], adminAttendance = [], attendanceSettings = null, onClockIn, onClockOut, onUpdateAttendanceRecord, onSettingsUpdated }) {
  const [active, setActive] = useState("inicio");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useIsMobile();
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Módulo clínico: toggle RRHH/Clínico + Context propio (ver src/context/ClinicalContext.jsx).
  // Vive aquí y no en cec_portal_concept.jsx para no seguir engordando el prop-drilling
  // del componente raíz — el módulo clínico consume su propio Context en vez de props.
  const [portalMode, setPortalMode] = useState("rrhh");
  const clinicalAccess = hasClinicalAccess(profile);
  const navItems = portalMode === "clinico" ? NAV_ITEMS_CLINICO : NAV_ITEMS_RRHH;

  const noAnim = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [displayActive, setDisplayActive] = useState("inicio");
  const [sectionPhase, setSectionPhase] = useState(null); // null = no anim on first mount
  const handlePortalModeChange = useCallback((mode) => {
    setPortalMode(prev => {
      if (prev === mode) return prev;
      setActive("inicio");
      setDisplayActive("inicio");
      return mode;
    });
  }, []);
  const navigate = useCallback((next) => {
    if (next === displayActive) return;
    if (next === "solicitudes") onClearSolicitudesUnread?.();
    if (next === "reconocimientos") onMarkRecognitionsRead?.();
    setActive(next);
    if (noAnim) { setDisplayActive(next); return; }
    setSectionPhase("out");
    setTimeout(() => { setDisplayActive(next); setSectionPhase("in"); }, 170);
  }, [displayActive, noAnim, onClearSolicitudesUnread]);
  const sectionAnim = (!sectionPhase || noAnim) ? {} : sectionPhase === "out"
    ? { animation: "sectionOut 0.17s ease-in both" }
    : { animation: "sectionIn 0.22s ease-out both" };
  const [dashDone, setDashDone] = useState(false);
  const dashboardInAnim = (!dashDone && !noAnim) ? { animation: "dashboardIn 0.45s ease-out both" } : {};

  const rrhhSectionTitles = { inicio: "Inicio", vacaciones: "Vacaciones", "calendario-equipo": "Calendario de equipo", comunicados: "Comunicados", encuestas: "Encuestas", reconocimientos: "Reconocimientos", comisiones: "Comisiones", documentos: "Documentos", solicitudes: "Solicitudes", tareas: "Tareas", asistencia: "Asistencia", perfil: "Mi perfil", aprobaciones: "Aprobaciones", "comunicados-admin": "Gestionar comunicados", "documentos-admin": "Gestionar documentos", "tareas-admin": "Gestionar tareas", "asistencia-admin": "Gestionar asistencia", empleados: "Empleados", "alta-empleado": "Gestión de empleados" };
  const clinicoSectionTitles = { inicio: "Inicio", pacientes: "Pacientes", agenda: "Agenda", "solicitudes-cita": "Solicitudes de cita", "notas-clinicas": "Notas clínicas" };
  const sectionTitle = (portalMode === "clinico" ? clinicoSectionTitles : rrhhSectionTitles)[displayActive];

  const pendingApprovalCount = (profile?.role === "admin")
    ? adminRequests.filter(r => r.status === "pendiente").length + adminReports.filter(r => r.status === "pendiente").length
    : 0;
  const pollsUnvotedCount = polls.filter(p => p.status === "activa" && myVotes[p.id] === undefined).length;
  const tasksPendingCount = myTasks.filter(t => t.status === "pendiente" && myTaskCompletions[t.id] === undefined).length;

  const vacationRequests = allRequests.filter(r => r.type === "vacaciones");
  const allSolicitudes = [
    ...allRequests.map(r => ({
      id: r.id, kind: "request", type: r.type,
      label: r.type === "vacaciones" ? "Vacaciones" : (r.category || "Permiso"),
      subtitle: r.start_date
        ? `${fmtSupaShort(r.start_date)} → ${fmtSupaShort(r.end_date || r.start_date)} · ${getEffectiveDays(r)} días`
        : (r.comment || ""),
      timeRange: (r.start_time && r.end_time) ? `${r.start_time.slice(0,5)} — ${r.end_time.slice(0,5)}` : null,
      status: r.status, created_at: r.created_at,
      reviewerName: r.reviewer?.full_name || null,
      reviewed_at: r.reviewed_at || null,
    })),
    ...reports.map(r => ({
      id: r.id, kind: "report",
      label: r.category || "Reporte",
      subtitle: r.description || "",
      location: r.location,
      photo_url: r.photo_url,
      status: r.status, created_at: r.created_at,
      resolution_note: r.resolution_note || null,
      reviewerName: r.reviewer?.full_name || null,
    })),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const vacationBalance = profile?.vacation_balance ?? VAC_TOTAL;
  const approvedDays  = vacationRequests.filter(r => r.status === "aprobado").reduce((a, r) => a + getEffectiveDays(r), 0);
  const pendingDays   = vacationRequests.filter(r => r.status === "pendiente").reduce((a, r) => a + getEffectiveDays(r), 0);
  const availableDays = Math.max(0, vacationBalance);
  const vacData = { approvedDays, pendingDays, availableDays, vacationBalance };

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }
  const initials = getInitials(profile?.full_name);

  const now = new Date();
  const hour = now.getHours();
  const timeGreeting = hour >= 5 && hour < 12 ? "Buenos días"
    : hour >= 12 && hour < 19 ? "Buenas tardes"
    : "Buenas noches";
  const displayName = profile?.alias?.trim() || getFirstNames(profile?.full_name) || "";
  const greeting = displayName ? `${timeGreeting}, ${displayName}` : timeGreeting;
  const DAY_NAMES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const todayStr = `${DAY_NAMES[now.getDay()]} ${now.getDate()} de ${MONTH_NAMES[now.getMonth()].toLowerCase()} de ${now.getFullYear()}`;
  const isBirthday = isBirthdayToday(profile?.birth_date);
  const dailyMessage = getDailyMessage();

  // Secciones RRHH: misma cadena de siempre, solo extraída a función para no
  // duplicarla entre el branch móvil y el de escritorio (idéntico output).
  const renderRRHHSection = (isMobileFlag) => (
    displayActive === "inicio" ? <DashboardHome isMobile={isMobileFlag} setActive={navigate} allSolicitudes={allSolicitudes} vacData={vacData} announcements={announcements} documents={documents} upcomingBirthdays={upcomingBirthdays} onNewRequest={onNewRequest} onNewReport={onNewReport} existingVacationRequests={vacationRequests} recognitions={recognitions} polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} onVoted={onVoted} myConfirmations={myConfirmations} myTasks={myTasks} myTaskCompletions={myTaskCompletions} onTaskCompleted={onTaskCompleted} myAttendance={myAttendance} onClockIn={onClockIn} onClockOut={onClockOut} /> : displayActive === "vacaciones" ? <VacationSection profile={profile} vacationRequests={vacationRequests} onNewRequest={onNewRequest} /> : displayActive === "calendario-equipo" ? <TeamCalendarSection teamVacations={teamVacations} /> : displayActive === "comunicados" ? <AnnouncementsSection announcements={announcements} profile={profile} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "reconocimientos" ? <RecognitionsSection recognitions={recognitions} onNewRecognition={onNewRecognition} onDeleteRecognition={onDeleteRecognition} userId={userId} profile={profile} teamDirectory={teamDirectory} onMarkRead={onMarkRecognitionsRead} unreadCount={recognitionsUnread} /> : displayActive === "documentos" ? <DocumentsSection documents={documents} myConfirmations={myConfirmations} userId={userId} onConfirmRead={onConfirmRead} /> : displayActive === "solicitudes" ? <SolicitudesSection allSolicitudes={allSolicitudes} onNewRequest={onNewRequest} onNewReport={onNewReport} availableDays={availableDays} existingVacationRequests={vacationRequests} onDeleteRequest={onDeleteRequest} onDeleteReport={onDeleteReport} /> : displayActive === "tareas" ? <TasksSection myTasks={myTasks} myTaskCompletions={myTaskCompletions} profile={profile} userId={userId} departmentsList={departmentsList} onNewTask={onNewTask} onDeleteTask={onDeleteTask} onTaskCompleted={onTaskCompleted} onTaskUncompleted={onTaskUncompleted} /> : displayActive === "asistencia" ? <AttendanceSection myAttendance={myAttendance} userId={userId} profile={profile} attendanceSettings={attendanceSettings} onClockIn={onClockIn} onClockOut={onClockOut} /> : displayActive === "perfil" ? <ProfileSection profile={profile} onAliasUpdated={onAliasUpdated} /> : displayActive === "aprobaciones" ? <AprobacionesSection adminRequests={adminRequests} adminReports={adminReports} onUpdateAdminRequest={onUpdateAdminRequest} onUpdateAdminReport={onUpdateAdminReport} onDeleteAdminRequest={onDeleteAdminRequest} onVacationCancelled={onVacationCancelled} reviewerName={profile?.full_name} showToast={showToast} /> : displayActive === "comunicados-admin" ? <GestionComunicadosSection adminAnnouncements={adminAnnouncements} departmentsList={departmentsList} onNewAnnouncement={onNewAnnouncement} onDeleteAnnouncement={onDeleteAnnouncement} /> : displayActive === "documentos-admin" ? <GestionDocumentosSection adminDocuments={adminDocuments} departmentsList={departmentsList} adminProfiles={adminProfiles} allConfirmations={allConfirmations} onNewDocument={onNewDocument} onDeleteDocument={onDeleteDocument} onUpdateAdminDocument={onUpdateAdminDocument} /> : displayActive === "tareas-admin" ? <GestionTareasSection adminTasks={adminTasks} allTaskCompletions={allTaskCompletions} adminProfiles={adminProfiles} departmentsList={departmentsList} onNewTask={onNewTask} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} /> : displayActive === "asistencia-admin" ? <GestionAsistenciaSection adminAttendance={adminAttendance} attendanceSettings={attendanceSettings} departmentsList={departmentsList} adminProfiles={adminProfiles} userId={userId} onUpdateAttendanceRecord={onUpdateAttendanceRecord} onSettingsUpdated={onSettingsUpdated} /> : displayActive === "empleados" ? <EmpleadosSection adminProfiles={adminProfiles} adminRequests={adminRequests} departmentsList={departmentsList} onUpdateProfile={onUpdateAdminProfile} /> : displayActive === "encuestas" ? <EncuestasSection polls={polls} myVotes={myVotes} pollResults={pollResults} userId={userId} profile={profile} departmentsList={departmentsList} onPollCreated={onPollCreated} onVoted={onVoted} onPollClosed={onPollClosed} onPollDeleted={onPollDeleted} /> : displayActive === "comisiones" ? <ComisionesSection profile={profile} userId={userId} exchangeRate={exchangeRate} mySales={mySales} allSales={allSales} onExchangeRateUpdated={onExchangeRateUpdated} onSaleDeleted={onSaleDeleted} showToast={showToast} /> : displayActive === "alta-empleado" ? <AltaEmpleadoSection departmentsList={departmentsList} /> : <PlaceholderSection title={sectionTitle} />
  );

  // Secciones del módulo clínico: por ahora Inicio, Pacientes y Agenda tienen
  // función propia; Solicitudes de cita / Notas clínicas van a PlaceholderSection
  // hasta que se construyan en prompts siguientes.
  const renderClinicoSection = () => (
    displayActive === "inicio" ? <DashboardClinicoHome isMobile={isMobile} profile={profile} userId={userId} />
    : displayActive === "pacientes" ? <PacientesSection userId={userId} profile={profile} />
    : displayActive === "agenda" ? <AgendaSection profile={profile} userId={userId} />
    : <PlaceholderSection title={sectionTitle} />
  );

  if (isMobile) {
    const mobileTree = (
      <div style={{ background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif" }}>
        {/* Header fijo móvil */}
        <div style={{
          position: "sticky", top: 0, zIndex: 50, width: "100%", boxSizing: "border-box",
          background: SIDEBAR_BG, padding: "10px 14px",
          display: "flex", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ width: 42, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Logo width={120} />
          </div>
          <button onClick={openDrawer} style={{
            width: 42, height: 42, border: "none",
            background: "rgba(255,255,255,0.1)", color: "#FFF",
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: 10, flexShrink: 0,
          }}>
            <Menu size={22} />
          </button>
        </div>
        {isBirthday && !noAnim && <BirthdayConfetti />}
        <MobileDrawer open={drawerOpen} onClose={closeDrawer} active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} solicitudesUnreadCount={solicitudesUnread} tasksPendingCount={tasksPendingCount} navItems={navItems} portalMode={portalMode} onPortalModeChange={handlePortalModeChange} showPortalToggle={clinicalAccess} />
        <div style={{ padding: "24px 16px 48px" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.22em", color: COLORS.gold, marginBottom: 4, textTransform: "uppercase", fontWeight: 600 }}>
            {todayStr}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
            {displayActive === "inicio" ? greeting : sectionTitle}
          </h1>
          {isBirthday && displayActive === "inicio" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 10px" }}>
              <Cake size={18} color={COLORS.gold} />
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, color: COLORS.gold }}>
                ¡Feliz cumpleaños!
              </span>
            </div>
          )}
          {displayActive === "inicio" && (
            <p style={{ fontSize: 13, color: COLORS.textMuted, margin: "0 0 20px", lineHeight: 1.55, fontStyle: "italic" }}>
              {dailyMessage}
            </p>
          )}
          {portalMode === "clinico" ? renderClinicoSection() : renderRRHHSection(true)}
        </div>
        {profile && profile.role !== "admin" && profile.role !== "inactivo" && userId && <SupportChatWidget userId={userId}/>}
      {(profile?.role === "admin") && userId && <AdminSupportChatWidget adminId={userId}/>}
      </div>
    );
    return clinicalAccess ? <ClinicalProvider userId={userId} profile={profile}>{mobileTree}</ClinicalProvider> : mobileTree;
  }

  const desktopTree = (
    <div style={{ display: "flex", background: COLORS.bg, minHeight: "100vh", fontFamily: "'Manrope', sans-serif", ...dashboardInAnim }} onAnimationEnd={(e) => { if (e.animationName === "dashboardIn") setDashDone(true); }}>
      {isBirthday && !noAnim && <BirthdayConfetti />}
      <Sidebar active={active} setActive={navigate} onLogout={onLogout} profile={profile} pendingApprovalCount={pendingApprovalCount} solicitudesUnreadCount={solicitudesUnread} recognitionsUnreadCount={recognitionsUnread} pollsUnvotedCount={pollsUnvotedCount} tasksPendingCount={tasksPendingCount} navItems={navItems} portalMode={portalMode} onPortalModeChange={handlePortalModeChange} showPortalToggle={clinicalAccess} />
      <div style={{ flex: 1, padding: "36px 40px", minWidth: 0 }}>
        <div style={sectionAnim} onAnimationEnd={(e) => { if (e.animationName === "sectionIn") setSectionPhase(null); }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.25em", color: COLORS.gold, marginBottom: 6, textTransform: "uppercase", fontWeight: 600 }}>
              {todayStr}
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, margin: "0 0 6px", color: COLORS.green }}>
              {displayActive === "inicio" ? greeting : sectionTitle}
            </h1>
            {isBirthday && displayActive === "inicio" && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px" }}>
                <Cake size={20} color={COLORS.gold} />
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, color: COLORS.gold }}>
                  ¡Feliz cumpleaños!
                </span>
              </div>
            )}
            {displayActive === "inicio" && (
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.6, fontStyle: "italic" }}>
                {dailyMessage}
              </p>
            )}
          </div>
          {portalMode === "clinico" ? renderClinicoSection() : renderRRHHSection(false)}
        </div>
      </div>
      {profile && profile.role !== "admin" && profile.role !== "inactivo" && userId && <SupportChatWidget userId={userId}/>}
      {(profile?.role === "admin") && userId && <AdminSupportChatWidget adminId={userId}/>}
    </div>
  );
  return clinicalAccess ? <ClinicalProvider userId={userId} profile={profile}>{desktopTree}</ClinicalProvider> : desktopTree;
}
