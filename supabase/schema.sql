-- ============================================================
-- CEC Colaboradores — Supabase Schema
-- Proyecto: awtydyrdhijjafwvxbzp
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA public;


-- ============================================================
-- TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                    uuid          NOT NULL,
  full_name             text,
  position              text,
  department            text,
  hire_date             date,
  birth_date            date,
  role                  text          DEFAULT 'empleado'::text,
  avatar_url            text,
  vacation_days_per_year int4         DEFAULT 21,
  vacation_balance      numeric       DEFAULT 0,
  departments           text[]        DEFAULT '{}'::text[],
  commission_eligible   bool          DEFAULT false,
  vacation_last_accrual date          DEFAULT CURRENT_DATE,
  alias                 text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.departments (
  id   uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.requests (
  id             uuid         DEFAULT gen_random_uuid() NOT NULL,
  user_id        uuid,
  type           text         DEFAULT 'vacaciones'::text,
  start_date     date,
  end_date       date,
  days_requested numeric,
  status         text         DEFAULT 'pendiente'::text,
  comment        text,
  created_at     timestamptz  DEFAULT now(),
  reviewed_by    uuid,
  reviewed_at    timestamptz,
  category       text,
  start_time     time,
  end_time       time,
  CONSTRAINT requests_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id              uuid        DEFAULT gen_random_uuid() NOT NULL,
  user_id         uuid,
  category        text,
  description     text,
  location        text,
  photo_url       text,
  status          text        DEFAULT 'pendiente'::text,
  created_at      timestamptz DEFAULT now(),
  reviewed_by     uuid,
  reviewed_at     timestamptz,
  resolution_note text,
  CONSTRAINT reports_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id            uuid        DEFAULT gen_random_uuid() NOT NULL,
  title         text        NOT NULL,
  body          text,
  tag           text,
  audience      text        DEFAULT 'todos'::text,
  publish_at    timestamptz DEFAULT now(),
  created_by    uuid,
  created_at    timestamptz DEFAULT now(),
  audience_list text[]      DEFAULT ARRAY['todos'::text],
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.documents (
  id                   uuid        DEFAULT gen_random_uuid() NOT NULL,
  title                text        NOT NULL,
  file_url             text,
  category             text,
  department           text,
  uploaded_by          uuid,
  created_at           timestamptz DEFAULT now(),
  departments          text[]      DEFAULT ARRAY['todos'::text],
  requires_confirmation bool       DEFAULT false,
  archived             bool        DEFAULT false,
  CONSTRAINT documents_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.document_confirmations (
  id           uuid        DEFAULT gen_random_uuid() NOT NULL,
  document_id  uuid,
  user_id      uuid,
  confirmed_at timestamptz DEFAULT now(),
  CONSTRAINT document_confirmations_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id               uuid        DEFAULT gen_random_uuid() NOT NULL,
  user_id          uuid,
  sender_id        uuid,
  message          text        NOT NULL,
  created_at       timestamptz DEFAULT now(),
  read_by_admin    bool        DEFAULT false,
  read_by_employee bool        DEFAULT true,
  CONSTRAINT support_messages_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.recognitions (
  id               uuid        DEFAULT gen_random_uuid() NOT NULL,
  from_user_id     uuid,
  to_user_id       uuid,
  category         text        NOT NULL,
  message          text        NOT NULL,
  created_at       timestamptz DEFAULT now(),
  read_by_recipient bool       DEFAULT false,
  CONSTRAINT recognitions_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.polls (
  id            uuid        DEFAULT gen_random_uuid() NOT NULL,
  question      text        NOT NULL,
  options       text[]      NOT NULL,
  status        text        DEFAULT 'activa'::text,
  created_by    uuid,
  created_at    timestamptz DEFAULT now(),
  audience_list text[]      DEFAULT ARRAY['todos'::text],
  CONSTRAINT polls_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id           uuid        DEFAULT gen_random_uuid() NOT NULL,
  poll_id      uuid,
  user_id      uuid,
  option_index int4        NOT NULL,
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT poll_votes_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id                   uuid        DEFAULT gen_random_uuid() NOT NULL,
  title                text        NOT NULL,
  description          text,
  created_by           uuid        NOT NULL,
  assigned_to          uuid,
  assigned_departments text[]      NOT NULL DEFAULT '{}',
  due_date             date,
  priority             text        DEFAULT 'media'::text CHECK (priority = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text])),
  status               text        DEFAULT 'pendiente'::text CHECK (status = ANY (ARRAY['pendiente'::text, 'cancelada'::text])),
  archived             bool        DEFAULT false,
  created_at           timestamptz DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_target_check CHECK (
    (assigned_to IS NOT NULL AND cardinality(assigned_departments) = 0) OR
    (assigned_to IS NULL AND cardinality(assigned_departments) > 0)
  )
);

CREATE TABLE IF NOT EXISTS public.task_completions (
  id           uuid        DEFAULT gen_random_uuid() NOT NULL,
  task_id      uuid        NOT NULL,
  user_id      uuid        NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT task_completions_pkey PRIMARY KEY (id),
  CONSTRAINT task_completions_task_id_user_id_key UNIQUE (task_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.commission_sales (
  id           uuid        DEFAULT gen_random_uuid() NOT NULL,
  user_id      uuid,
  sale_date    date        DEFAULT CURRENT_DATE NOT NULL,
  amount       numeric     NOT NULL CHECK (amount > 0),
  currency     text        NOT NULL CHECK (currency = ANY (ARRAY['USD'::text, 'CRC'::text])),
  service_name text        NOT NULL,
  client_name  text        NOT NULL,
  locked       bool        DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT commission_sales_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.exchange_rate (
  id         int4        DEFAULT 1 NOT NULL,
  rate       numeric     NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid,
  CONSTRAINT exchange_rate_pkey PRIMARY KEY (id)
);


-- ============================================================
-- FOREIGN KEYS
-- ============================================================

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id);

ALTER TABLE public.requests
  ADD CONSTRAINT requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT requests_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);

ALTER TABLE public.reports
  ADD CONSTRAINT reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT reports_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id);

ALTER TABLE public.announcements
  ADD CONSTRAINT announcements_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.documents
  ADD CONSTRAINT documents_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id);

ALTER TABLE public.document_confirmations
  ADD CONSTRAINT document_confirmations_document_id_fkey
  FOREIGN KEY (document_id) REFERENCES public.documents(id),
  ADD CONSTRAINT document_confirmations_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.support_messages
  ADD CONSTRAINT support_messages_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT support_messages_sender_id_fkey
  FOREIGN KEY (sender_id) REFERENCES public.profiles(id);

ALTER TABLE public.recognitions
  ADD CONSTRAINT recognitions_from_user_id_fkey
  FOREIGN KEY (from_user_id) REFERENCES public.profiles(id),
  ADD CONSTRAINT recognitions_to_user_id_fkey
  FOREIGN KEY (to_user_id) REFERENCES public.profiles(id);

ALTER TABLE public.polls
  ADD CONSTRAINT polls_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id);

ALTER TABLE public.poll_votes
  ADD CONSTRAINT poll_votes_poll_id_fkey
  FOREIGN KEY (poll_id) REFERENCES public.polls(id),
  ADD CONSTRAINT poll_votes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  ADD CONSTRAINT tasks_assigned_to_fkey
  FOREIGN KEY (assigned_to) REFERENCES public.profiles(id);

ALTER TABLE public.task_completions
  ADD CONSTRAINT task_completions_task_id_fkey
  FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
  ADD CONSTRAINT task_completions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.commission_sales
  ADD CONSTRAINT commission_sales_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id);

ALTER TABLE public.exchange_rate
  ADD CONSTRAINT exchange_rate_updated_by_fkey
  FOREIGN KEY (updated_by) REFERENCES public.profiles(id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recognitions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_sales       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rate          ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('admin', 'rrhh')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_departments()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT departments FROM profiles WHERE id = auth.uid();
$$;


-- ============================================================
-- POLÍTICAS RLS
-- ============================================================

-- profiles
CREATE POLICY "Ver perfil propio o admin ve todos"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Editar perfil propio o admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Admin puede crear perfiles"
  ON public.profiles FOR INSERT
  WITH CHECK (is_admin());

-- departments
CREATE POLICY "Todos pueden ver departamentos"
  ON public.departments FOR SELECT
  USING (true);

-- requests
CREATE POLICY "Ver solicitudes propias o admin ve todas"
  ON public.requests FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Empleados ven vacaciones aprobadas de todos"
  ON public.requests FOR SELECT
  USING (type = 'vacaciones' AND status = 'aprobado');

CREATE POLICY "Crear solicitudes propias"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin actualiza solicitudes"
  ON public.requests FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admin puede eliminar solicitudes"
  ON public.requests FOR DELETE
  USING (is_admin());

CREATE POLICY "employees can delete own pending requests"
  ON public.requests FOR DELETE
  USING (auth.uid() = user_id AND status = 'pendiente');

-- reports
CREATE POLICY "Ver reportes propios o admin ve todos"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Crear reportes propios"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin actualiza reportes"
  ON public.reports FOR UPDATE
  USING (is_admin());

CREATE POLICY "employees can delete own pending reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id AND status = 'pendiente');

-- announcements
CREATE POLICY "Ver comunicados segun audiencia o admin"
  ON public.announcements FOR SELECT
  USING (
    is_admin() OR (
      publish_at <= now() AND (
        'todos' = ANY (audience_list) OR
        audience_list && get_my_departments()
      )
    )
  );

CREATE POLICY "Admin gestiona comunicados"
  ON public.announcements FOR ALL
  USING (is_admin());

-- documents
CREATE POLICY "Ver documentos segun departamento o admin"
  ON public.documents FOR SELECT
  USING (
    is_admin() OR
    'todos' = ANY (departments) OR
    departments && get_my_departments()
  );

CREATE POLICY "Admin gestiona documentos"
  ON public.documents FOR ALL
  USING (is_admin());

-- document_confirmations
CREATE POLICY "Ver confirmaciones propias o admin ve todas"
  ON public.document_confirmations FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Confirmar lectura"
  ON public.document_confirmations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin elimina confirmaciones"
  ON public.document_confirmations FOR DELETE
  USING (is_admin());

-- support_messages
CREATE POLICY "Ver mensajes propios o admin ve todos"
  ON public.support_messages FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Enviar mensajes"
  ON public.support_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid() AND (user_id = auth.uid() OR is_admin()));

CREATE POLICY "Marcar como leido"
  ON public.support_messages FOR UPDATE
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Eliminar mensajes propios o admin"
  ON public.support_messages FOR DELETE
  USING (user_id = auth.uid() OR is_admin());

-- recognitions
CREATE POLICY "Todos pueden ver reconocimientos"
  ON public.recognitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Empleados dan reconocimientos"
  ON public.recognitions FOR INSERT
  WITH CHECK (auth.uid() = from_user_id AND from_user_id <> to_user_id);

CREATE POLICY "Recipiente marca como leido"
  ON public.recognitions FOR UPDATE
  USING (auth.uid() = to_user_id);

CREATE POLICY "Admin elimina reconocimientos"
  ON public.recognitions FOR DELETE
  USING (is_admin());

-- polls
CREATE POLICY "Ver encuestas segun audiencia o admin"
  ON public.polls FOR SELECT
  USING (
    is_admin() OR
    'todos' = ANY (audience_list) OR
    audience_list && get_my_departments()
  );

CREATE POLICY "Admin gestiona encuestas"
  ON public.polls FOR ALL
  USING (is_admin());

-- poll_votes
CREATE POLICY "Ver votos"
  ON public.poll_votes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Votar"
  ON public.poll_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cambiar mi voto"
  ON public.poll_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- tasks
CREATE POLICY "Ver tareas asignadas propias o admin"
  ON public.tasks FOR SELECT
  USING (
    (select is_admin()) OR
    assigned_to = (select auth.uid()) OR
    created_by = (select auth.uid()) OR
    'todos' = ANY (assigned_departments) OR
    assigned_departments && (select get_my_departments())
  );

CREATE POLICY "Admin gestiona tareas"
  ON public.tasks FOR ALL
  USING ((select is_admin()));

CREATE POLICY "Empleados crean pendientes propios"
  ON public.tasks FOR INSERT
  WITH CHECK (
    created_by = (select auth.uid()) AND
    assigned_to = (select auth.uid()) AND
    cardinality(assigned_departments) = 0
  );

CREATE POLICY "Empleados editan sus pendientes propios"
  ON public.tasks FOR UPDATE
  USING (created_by = (select auth.uid()) AND assigned_to = (select auth.uid()))
  WITH CHECK (
    created_by = (select auth.uid()) AND
    assigned_to = (select auth.uid()) AND
    cardinality(assigned_departments) = 0
  );

CREATE POLICY "Empleados eliminan sus pendientes propios"
  ON public.tasks FOR DELETE
  USING (created_by = (select auth.uid()) AND assigned_to = (select auth.uid()));

-- task_completions
CREATE POLICY "Ver completaciones propias o admin"
  ON public.task_completions FOR SELECT
  USING (( (select auth.uid()) = user_id ) OR (select is_admin()));

CREATE POLICY "Marcar tarea propia como completada"
  ON public.task_completions FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Deshacer propia completacion"
  ON public.task_completions FOR DELETE
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Admin elimina completaciones"
  ON public.task_completions FOR DELETE
  USING ((select is_admin()));

-- commission_sales
CREATE POLICY "Ver ventas propias o admin ve todas"
  ON public.commission_sales FOR SELECT
  USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Registrar venta propia si es elegible"
  ON public.commission_sales FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    (SELECT commission_eligible FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Editar venta propia no bloqueada o admin"
  ON public.commission_sales FOR UPDATE
  USING (auth.uid() = user_id AND locked = false OR is_admin());

CREATE POLICY "Eliminar venta propia no bloqueada o admin"
  ON public.commission_sales FOR DELETE
  USING (auth.uid() = user_id AND locked = false OR is_admin());

-- exchange_rate
CREATE POLICY "Ver tipo de cambio"
  ON public.exchange_rate FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin actualiza tipo de cambio"
  ON public.exchange_rate FOR UPDATE
  USING (is_admin());


-- ============================================================
-- FUNCIONES / RPCs
-- ============================================================

-- Trigger: crear perfil vacío al registrar usuario en auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Acumulación mensual de vacaciones (1 día por mes en fecha de aniversario)
CREATE OR REPLACE FUNCTION public.accrue_monthly_vacations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rec record;
  target_day int;
  days_in_this_month int;
  accrual_day int;
BEGIN
  FOR rec IN
    SELECT id, hire_date, vacation_last_accrual
    FROM profiles
    WHERE hire_date IS NOT NULL AND role != 'inactivo'
  LOOP
    target_day         := EXTRACT(DAY FROM rec.hire_date);
    days_in_this_month := EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'));
    accrual_day        := LEAST(target_day, days_in_this_month);

    IF EXTRACT(DAY FROM CURRENT_DATE) = accrual_day
       AND (rec.vacation_last_accrual IS NULL
            OR DATE_TRUNC('month', rec.vacation_last_accrual) < DATE_TRUNC('month', CURRENT_DATE))
    THEN
      UPDATE profiles
      SET vacation_balance      = vacation_balance + 1,
          vacation_last_accrual = CURRENT_DATE
      WHERE id = rec.id;
    END IF;
  END LOOP;
END;
$$;

-- Ajustar saldo de vacaciones (solo admin)
CREATE OR REPLACE FUNCTION public.adjust_vacation_balance(p_user_id uuid, p_days_delta numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE profiles
  SET vacation_balance = vacation_balance + p_days_delta
  WHERE id = p_user_id;
END;
$$;

-- Restablecer contraseña (solo admin)
CREATE OR REPLACE FUNCTION public.admin_reset_password(target_user_id uuid, new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf')),
      updated_at = now()
  WHERE id = target_user_id;
END;
$$;

-- Cumpleaños del equipo
CREATE OR REPLACE FUNCTION public.get_birthdays()
RETURNS TABLE(id uuid, full_name text, birth_date date)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, full_name, birth_date
  FROM profiles
  WHERE birth_date IS NOT NULL
    AND role != 'inactivo';
$$;

-- Directorio del equipo
CREATE OR REPLACE FUNCTION public.get_team_directory()
RETURNS TABLE(id uuid, full_name text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT id, full_name
  FROM profiles
  WHERE role != 'inactivo'
  ORDER BY full_name;
$$;

-- Vacaciones aprobadas del equipo (para calendario)
CREATE OR REPLACE FUNCTION public.get_team_vacations()
RETURNS TABLE(full_name text, departments text[], start_date date, end_date date)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT p.full_name, p.departments, r.start_date, r.end_date
  FROM requests r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.type = 'vacaciones'
    AND r.status = 'aprobado'
    AND p.role != 'inactivo';
$$;

-- Feed de reconocimientos
CREATE OR REPLACE FUNCTION public.get_recognitions_feed()
RETURNS TABLE(
  id uuid, from_user_id uuid, to_user_id uuid,
  from_name text, to_name text,
  category text, message text,
  created_at timestamptz, read_by_recipient boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT r.id, r.from_user_id, r.to_user_id,
         pf.full_name AS from_name, pt.full_name AS to_name,
         r.category, r.message, r.created_at, r.read_by_recipient
  FROM recognitions r
  JOIN profiles pf ON pf.id = r.from_user_id
  JOIN profiles pt ON pt.id = r.to_user_id
  ORDER BY r.created_at DESC;
$$;

-- Resultados de encuesta
CREATE OR REPLACE FUNCTION public.get_poll_results(poll_id_input uuid)
RETURNS TABLE(option_index integer, votes bigint)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT option_index, COUNT(*) AS votes
  FROM poll_votes
  WHERE poll_id = poll_id_input
  GROUP BY option_index;
$$;

-- Departamentos del usuario actual
CREATE OR REPLACE FUNCTION public.get_my_departments()
RETURNS text[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT departments FROM profiles WHERE id = auth.uid();
$$;
