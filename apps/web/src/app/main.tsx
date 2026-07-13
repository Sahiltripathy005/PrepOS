import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { LoadingBoundary } from "./LoadingBoundary.js";
import {
  SettingsProvider,
  ToastProvider,
  ModalProvider,
  BaseAppShell,
  BaseCard,
  BaseStack,
  BaseBadge,
  NavItem
} from "@placementos/ui";
import { ComponentShowcase } from "./ComponentShowcase.js";
import "../index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000
    }
  }
});

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", icon: "home" },
  { label: "Practice Log", path: "/practice", icon: "terminal" },
  { label: "Revision Queue", path: "/revision", icon: "activity" },
  { label: "Study Guides", path: "/study", icon: "book" },
  { label: "Companies", path: "/companies", icon: "briefcase" },
  { label: "Settings", path: "/settings", icon: "settings" }
];

function AppContent() {
  const [activePath, setActivePath] = React.useState("/");

  const getBreadcrumbs = () => {
    if (activePath === "/") return ["placementos", "dashboard"];
    const segment = activePath.substring(1);
    return ["placementos", segment];
  };

  const renderContent = () => {
    switch (activePath) {
      case "/":
      case "/settings":
        return <ComponentShowcase />;
      default:
        return (
          <BaseCard style={{ textAlign: "center", padding: "40px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
              {navItems.find((n) => n.path === activePath)?.label} Domain Layer
            </h3>
            <p style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "16px" }}>
              This page belongs to the business domain layer and is pending integration.
            </p>
            <BaseBadge variant="warning">PENDING INTEGRATION</BaseBadge>
          </BaseCard>
        );
    }
  };

  const renderRightPanel = () => {
    return (
      <BaseStack gap="var(--spacing-md)">
        <h4 style={{ fontSize: "13px", fontWeight: 600, borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
          Diagnostic Feed
        </h4>
        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "var(--color-success-text)" }}>[OK]</span> UI tokens bound to document element.
          </div>
          <div style={{ marginBottom: "8px" }}>
            <span style={{ color: "var(--color-accent-solid)" }}>[INFO]</span> Responsive breakpoint: Desktop layout active.
          </div>
          <div>
            <span style={{ color: "var(--color-success-text)" }}>[OK]</span> Event listeners initialized.
          </div>
        </div>
      </BaseStack>
    );
  };

  return (
    <BaseAppShell
      navItems={navItems}
      activePath={activePath}
      onNavigate={(path) => setActivePath(path)}
      breadcrumbs={getBreadcrumbs()}
      rightPanel={renderRightPanel()}
    >
      {renderContent()}
    </BaseAppShell>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ToastProvider>
            <ModalProvider>
              <LoadingBoundary>
                <AppContent />
              </LoadingBoundary>
            </ModalProvider>
          </ToastProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
