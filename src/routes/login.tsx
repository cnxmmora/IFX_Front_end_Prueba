import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Logo } from "@/components/Logo";
import { authApi } from "@/lib/api";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z.string().trim().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const registerSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(80, "El nombre no puede superar 80 caracteres")
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s'-]*$/, "El nombre solo debe contener letras y espacios"),
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z
    .string()
    .trim()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga")
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, "Usa mayúsculas, minúsculas y al menos un número"),
  phone: z.string().trim().min(8, "Ingresa un teléfono válido").max(25, "Ingresa un teléfono válido"),
  role: z.enum(["Cliente", "Administrador"]),
  adminKey: z.string().trim().max(120, "La clave es demasiado larga").optional(),
}).superRefine((values, context) => {
  if (values.role === "Administrador" && !values.adminKey) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["adminKey"],
      message: "La clave de administrador es obligatoria",
    });
  }
});

const smsCodeSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "El código debe tener 6 dígitos"),
});

type AuthTab = "login" | "register";

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type SmsCodeValues = z.infer<typeof smsCodeSchema>;
type RegisterModalState = {
  values: RegisterValues;
} | null;

const RESEND_DELAY_SECONDS = 30;

const heroStats = [
  { value: "HttpOnly", label: "cookie segura para el JWT" },
  { value: "Realtime", label: "WebSocket para cambios de estado" },
  { value: "Optimistic", label: "creación, edición y borrado instantáneo" },
];

const tabs: Array<{ key: AuthTab; label: string; icon: typeof ShieldCheck }> = [
  { key: "login", label: "Ingreso", icon: ShieldCheck },
  { key: "register", label: "Registro", icon: UserPlus },
];

function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  return <AuthWorkspace activeTab={activeTab} onTabChange={setActiveTab} />;
}

function AuthWorkspace({
  activeTab,
  onTabChange,
}: Readonly<{
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}>) {
  const ActiveIcon = tabs.find((tab) => tab.key === activeTab)?.icon ?? ShieldCheck;

  return (
    <main className="page-fade-in relative min-h-screen overflow-hidden px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
      <div className="bg-accent-mesh pointer-events-none absolute inset-0 opacity-100" aria-hidden />
      <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-[2rem] border border-border/70 shadow-2xl shadow-black/20 lg:grid-cols-[1.1fr_0.9fr]">
        <AuthHero />

        <section className="surface-panel flex flex-col justify-center p-6 md:p-8 lg:p-10">
          <div className="mx-auto w-full max-w-[520px]">
            <div className="mb-8 flex items-center gap-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-border/70 bg-primary/10 text-primary">
                <ActiveIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Acceso seguro</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-foreground">Bienvenido a TestFX</h2>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2 rounded-2xl border border-border/70 bg-background/50 p-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.key === activeTab;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => onTabChange(tab.key)}
                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-cyan-500/15"
                        : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === "login" ? <LoginForm /> : null}
            {activeTab === "register" ? <RegisterForm /> : null}
            <p className="mt-6 text-sm text-muted-foreground">
              El JWT se entrega por cookie HttpOnly. Si la sesión expira, vuelve a iniciar sesión.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function AuthHero() {
  return (
    <section className="relative flex flex-col justify-between overflow-hidden bg-[linear-gradient(160deg,rgba(9,15,27,0.94),rgba(17,24,39,0.88),rgba(8,47,73,0.96))] p-7 text-white md:p-10 lg:p-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_28%)]" aria-hidden />
      <div className="relative flex items-start justify-between gap-6">
        <Logo size="lg" />
        <div className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-white/70 backdrop-blur">
          Secure access
        </div>
      </div>

      <div className="relative max-w-xl py-10 md:py-16">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200">
          <Sparkles className="h-3.5 w-3.5" />
          Portal privado de VMs
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
          Gestiona infraestructura con una interfaz limpia, rápida y segura.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/72 md:text-lg">
          Login, registro con Twilio, dashboards con gráficos y CRUD optimista para máquinas virtuales. Todo via cookie HttpOnly, sin exponer el JWT al navegador.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <Card
              key={stat.label}
              variant="outline"
              className="border-white/30 bg-slate-950/60 p-4 text-white shadow-none backdrop-blur-md"
            >
              <p className="text-2xl font-semibold tracking-[-0.04em] text-white/98">{stat.value}</p>
              <p className="mt-1 text-sm leading-6 text-white/90">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="relative flex flex-wrap items-center gap-3 text-sm text-white/65">
        <span>Admin demo: admin@testfx.local / Admin123!</span>
        <span className="hidden h-1 w-1 rounded-full bg-white/30 sm:inline-flex" />
        <span>Cliente demo: cliente@testfx.local / Cliente123!</span>
      </div>
    </section>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setBusy(true);
    try {
      await authApi.login(values);
      toast.success("Sesión iniciada");
      navigate({ to: "/portal" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo iniciar sesión");
    } finally {
      setBusy(false);
    }
  });

  return (
    <form className="grid gap-4" onSubmit={submit} noValidate>
      <Field
        label="Correo"
        error={form.formState.errors.email?.message}
        input={
          <input
            {...form.register("email")}
            type="email"
            autoComplete="email"
            placeholder="admin@testfx.local"
            className={inputClass}
          />
        }
      />
      <Field
        label="Contraseña"
        error={form.formState.errors.password?.message}
        input={
          <div className="relative">
            <input
              {...form.register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-3 inline-flex items-center text-muted-foreground hover:text-foreground"
              aria-label="Mostrar o ocultar contraseña"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        }
      />
      <Button type="submit" className="mt-2 w-full" disabled={busy}>
        {busy ? "Ingresando..." : "Entrar al dashboard"}
      </Button>
    </form>
  );
}

function RegisterForm() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [modalState, setModalState] = useState<RegisterModalState>(null);
  const [sendingSms, setSendingSms] = useState(false);
  const [resendingSms, setResendingSms] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      phone: "",
      role: "Cliente",
      adminKey: "",
    },
  });

  const selectedRole = form.watch("role");

  const verificationForm = useForm<SmsCodeValues>({
    resolver: zodResolver(smsCodeSchema),
    mode: "onChange",
    defaultValues: { code: "" },
  });

  let submitButtonLabel = "Verificar y crear cuenta";
  if (verifyingCode) {
    submitButtonLabel = "Validando código...";
  }
  if (!verifyingCode && sendingSms) {
    submitButtonLabel = "Enviando SMS...";
  }

  let resendButtonLabel = "Reenviar código";
  if (resendingSms) {
    resendButtonLabel = "Reenviando...";
  }
  if (!resendingSms && resendCountdown > 0) {
    resendButtonLabel = `Reenviar en ${resendCountdown}s`;
  }

  const startResendCooldown = () => {
    setResendCountdown(RESEND_DELAY_SECONDS);
  };

  const sendVerificationSms = async (phone: string, isResend = false) => {
    if (isResend) {
      setResendingSms(true);
    } else {
      setSendingSms(true);
    }

    try {
      await authApi.sendSmsCode({ phone });
      toast.success(isResend ? "Código reenviado por SMS" : "Cuenta creada. Código enviado por SMS");
      startResendCooldown();
    } finally {
      if (isResend) {
        setResendingSms(false);
      } else {
        setSendingSms(false);
      }
    }
  };

  const submit = form.handleSubmit(async (values) => {
    const phone = values.phone.trim();
    const registerValues = {
      ...values,
      phone,
      adminKey: values.role === "Administrador" ? values.adminKey?.trim() || undefined : undefined,
    };
    setBusy(true);
    try {
      await authApi.register(registerValues);
      setModalState({ values: registerValues });
      await sendVerificationSms(phone);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo completar el registro con SMS");
      setModalState(null);
    } finally {
      setBusy(false);
    }
  });

  const closeModal = () => {
    setModalState(null);
    verificationForm.reset();
    setBusy(false);
    setSendingSms(false);
    setResendingSms(false);
    setVerifyingCode(false);
    setResendCountdown(0);
  };

  const verifyAndRegister = verificationForm.handleSubmit(async ({ code }) => {
    if (!modalState) return;

    setVerifyingCode(true);
    try {
      await authApi.verifySmsCode({ phone: modalState.values.phone, code });
      toast.success("Cuenta validada por SMS");
      closeModal();
      navigate({ to: "/portal" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo validar el código SMS");
    } finally {
      setVerifyingCode(false);
    }
  });

  useEffect(() => {
    if (!modalState) return;
    verificationForm.setFocus("code");
  }, [modalState, verificationForm]);

  useEffect(() => {
    if (!modalState || resendCountdown <= 0) return;

    const intervalId = globalThis.setInterval(() => {
      setResendCountdown((current) => {
        if (current <= 1) {
          globalThis.clearInterval(intervalId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => globalThis.clearInterval(intervalId);
  }, [modalState, resendCountdown]);

  return (
    <>
      <form className="grid gap-4" onSubmit={submit} noValidate>
        <Field label="Nombre completo" error={form.formState.errors.nombre?.message} input={<input {...form.register("nombre")} placeholder="Laura Pérez" className={inputClass} />} />
        <Field
          label="Correo"
          error={form.formState.errors.email?.message}
          input={<input {...form.register("email")} type="email" autoComplete="email" placeholder="laura@empresa.com" className={inputClass} />}
        />
        <Field
          label="Contraseña"
          error={form.formState.errors.password?.message}
          input={<input {...form.register("password")} type="password" autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={inputClass} />}
        />
        <Field
          label="Teléfono para Twilio"
          hint="Necesario para enviar el código de verificación."
          error={form.formState.errors.phone?.message}
          input={<input {...form.register("phone")} type="tel" autoComplete="tel" placeholder="+57 300 123 4567" className={inputClass} />}
        />
        <Field
          label="Rol"
          hint="Define el perfil con el que se creará la cuenta."
          error={form.formState.errors.role?.message}
          input={
            <select {...form.register("role")} className={inputClass}>
              <option value="Cliente">Cliente</option>
              <option value="Administrador">Administrador</option>
            </select>
          }
        />
        {selectedRole === "Administrador" ? (
          <Field
            label="Clave de administrador"
            hint="Debe coincidir con VM_ADMIN_SIGNUP_KEY del backend."
            error={form.formState.errors.adminKey?.message}
            input={<input {...form.register("adminKey")} type="password" placeholder="Ingresa la clave" className={inputClass} />}
          />
        ) : null}
        <Button type="submit" className="mt-2 w-full" disabled={busy}>
          {busy ? "Preparando verificación..." : "Crear cuenta"}
        </Button>
      </form>

      {modalState ? (
        <div className="fixed inset-0 z-[1400] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-lg rounded-[2rem] p-6 md:p-8 soft-slide-up">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Paso 2 de 2 · Verificación SMS</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">Ingresa el código enviado</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Se envió un código de 6 dígitos a <span className="font-medium text-foreground">{modalState.values.phone}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
              El código se genera en el servidor y se envía por Twilio al número indicado.
            </div>

            <form className="grid gap-4" onSubmit={verifyAndRegister} noValidate>
              <Field
                label="Código de 6 dígitos"
                error={verificationForm.formState.errors.code?.message}
                input={<input {...verificationForm.register("code")} inputMode="numeric" placeholder="123456" className={inputClass} />}
              />

              <Button type="submit" className="w-full" disabled={verifyingCode || sendingSms}>
                {submitButtonLabel}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => sendVerificationSms(modalState.values.phone, true)}
                disabled={resendingSms || resendCountdown > 0 || verifyingCode || sendingSms}
              >
                {resendButtonLabel}
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Field({
  label,
  hint,
  error,
  input,
}: Readonly<{
  label: string;
  hint?: string;
  error?: string;
  input: ReactNode;
}>) {
  return (
    <label className="grid gap-2">
      <div className="flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {input}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-border/80 bg-background/70 px-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_rgba(56,189,248,0.08)]";
