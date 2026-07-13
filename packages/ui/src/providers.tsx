import * as React from "react";
import { injectStyles } from "./styles.js";

// --- Theme & Settings Context ---
export interface ThemeSettings {
  themeMode: "light" | "dark" | "system";
  accentScale: "blue" | "steel" | "emerald" | "gray";
  densityMode: "comfortable" | "condensed";
  borderRadiusPx: number;
}

interface SettingsContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resolvedTheme: "light" | "dark";
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<ThemeSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("pos-settings");
      if (stored) {
        try {
          return { ...defaultSettings, ...JSON.parse(stored) };
        } catch {
          // Fallback to defaults
        }
      }
    }
    return defaultSettings;
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    injectStyles();
  }, []);

  React.useEffect(() => {
    const updateTheme = () => {
      let theme: "light" | "dark" = "dark";
      if (settings.themeMode === "system") {
        theme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } else {
        theme = settings.themeMode;
      }
      setResolvedTheme(theme);

      const root = window.document.documentElement;
      root.setAttribute("data-theme", theme);
      root.setAttribute("data-accent", settings.accentScale);
      root.setAttribute("data-density", settings.densityMode);
      root.style.setProperty("--radius-sm", `${settings.borderRadiusPx / 2}px`);
      root.style.setProperty("--radius-md", `${settings.borderRadiusPx}px`);
      root.style.setProperty("--radius-lg", `${settings.borderRadiusPx * 2}px`);
    };

    updateTheme();

    if (settings.themeMode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", updateTheme);
      return () => media.removeEventListener("change", updateTheme);
    }
    return undefined;
  }, [settings]);

  const updateSettings = React.useCallback((newSettings: Partial<ThemeSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("pos-settings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resolvedTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

const defaultSettings: ThemeSettings = {
  themeMode: "dark",
  accentScale: "blue",
  densityMode: "comfortable",
  borderRadiusPx: 4
};

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

// --- Toast Feedback Context ---
export interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"], duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = React.useCallback(
    (message: string, type: Toast["type"] = "info", duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
      {/* Portaled Toast Container */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          zIndex: 9999,
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => dismissToast(toast.id)}
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-primary)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              pointerEvents: "auto",
              transition: "transform 150ms cubic-bezier(0.16, 1, 0.3, 1)"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor:
                  toast.type === "success"
                    ? "var(--color-success-text)"
                    : toast.type === "warning"
                      ? "var(--color-warning-text)"
                      : toast.type === "error"
                        ? "var(--color-error-text)"
                        : "var(--color-accent-solid)"
              }}
            />
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// --- Modal Context ---
interface ModalConfig {
  title: string;
  content: React.ReactNode;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ModalContextType {
  openModal: (config: ModalConfig) => void;
  closeModal: () => void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modalConfig, setModalConfig] = React.useState<ModalConfig | null>(null);

  const openModal = React.useCallback((config: ModalConfig) => {
    setModalConfig(config);
  }, []);

  const closeModal = React.useCallback(() => {
    setModalConfig(null);
  }, []);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalConfig && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9990,
            backdropFilter: "blur(2px)"
          }}
          onClick={closeModal}
        >
          <div
            style={{
              backgroundColor: "var(--color-bg-primary)",
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "20px",
              minWidth: "320px",
              maxWidth: "500px",
              boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
              pointerEvents: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: "12px", fontSize: "16px", fontWeight: 600 }}>
              {modalConfig.title}
            </h3>
            <div style={{ marginBottom: "20px", fontSize: "14px", color: "var(--color-text-muted)" }}>
              {modalConfig.content}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={closeModal}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-subtle)",
                  backgroundColor: "transparent",
                  color: "var(--color-text-primary)",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {modalConfig.cancelLabel || "Cancel"}
              </button>
              <button
                onClick={() => {
                  modalConfig.onConfirm?.();
                  closeModal();
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "var(--color-accent-solid)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "13px"
                }}
              >
                {modalConfig.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
