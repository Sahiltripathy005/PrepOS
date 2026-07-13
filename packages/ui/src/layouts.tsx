import * as React from "react";
import { Icon } from "./icons.js";
import { BaseIconButton } from "./components.js";

// --- Flex / Stack / Spacer ---
export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "column";
  gap?: string | number;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
}

export const BaseFlex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = "row", gap, align, justify, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: direction,
          gap: typeof gap === "number" ? `${gap}px` : gap,
          alignItems: align,
          justifyContent: justify,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BaseFlex.displayName = "BaseFlex";

export const BaseStack = React.forwardRef<HTMLDivElement, Omit<FlexProps, "direction">>(
  ({ gap = "var(--spacing-xs)", children, ...props }, ref) => {
    return <BaseFlex ref={ref} direction="column" gap={gap} {...props} />;
  }
);
BaseStack.displayName = "BaseStack";

export const BaseSpacer: React.FC = () => <div style={{ flexGrow: 1 }} />;

// --- Grid ---
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: string | number;
}

export const BaseGrid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols = 1, gap = "var(--spacing-md)", children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: typeof gap === "number" ? `${gap}px` : gap,
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BaseGrid.displayName = "BaseGrid";

// --- Container ---
export const BaseContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1200px",
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: "var(--spacing-md)",
        paddingRight: "var(--spacing-md)",
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// --- SplitView / Resizable Panels ---
interface SplitViewProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number; // 0 to 1
}

export const BaseSplitView: React.FC<SplitViewProps> = ({ left, right, defaultRatio = 0.5 }) => {
  const [ratio, setRatio] = React.useState(defaultRatio);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newRatio = (moveEvent.clientX - rect.left) / rect.width;
      setRatio(Math.max(0.15, Math.min(0.85, newRatio)));
    };
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden"
      }}
    >
      <div style={{ width: `${ratio * 100}%`, overflowY: "auto" }}>{left}</div>
      <div
        onMouseDown={handleMouseDown}
        style={{
          width: "4px",
          backgroundColor: "var(--color-border-subtle)",
          cursor: "col-resize",
          transition: "background-color 150ms var(--motion-ease)"
        }}
      />
      <div style={{ width: `${(1 - ratio) * 100}%`, overflowY: "auto" }}>{right}</div>
    </div>
  );
};

// --- Application Shell ---
export interface NavItem {
  label: string;
  path: string;
  icon: any; // using string keys or ReactNode
}

interface AppShellProps {
  children: React.ReactNode;
  navItems: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
  breadcrumbs?: string[];
  rightPanel?: React.ReactNode;
}

export const BaseAppShell: React.FC<AppShellProps> = ({
  children,
  navItems,
  activePath,
  onNavigate,
  breadcrumbs = [],
  rightPanel
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [rightPanelOpen, setRightPanelOpen] = React.useState(true);

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-primary)",
        color: "var(--color-text-primary)"
      }}
    >
      {/* Navigation Sidebar */}
      <aside
        style={{
          width: sidebarCollapsed ? "60px" : "240px",
          borderRight: "1px solid var(--color-border-subtle)",
          backgroundColor: "var(--color-bg-secondary)",
          display: "flex",
          flexDirection: "column",
          transition: "width 150ms var(--motion-ease)",
          overflow: "hidden"
        }}
      >
        {/* Header */}
        <div
          style={{
            height: "56px",
            borderBottom: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            gap: "12px"
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              backgroundColor: "var(--color-accent-solid)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "white"
            }}
          >
            P
          </div>
          {!sidebarCollapsed && (
            <span style={{ fontWeight: 600, fontSize: "14px", letterSpacing: "-0.5px" }}>
              PlacementOS
            </span>
          )}
        </div>

        {/* Links */}
        <nav style={{ flexGrow: 1, padding: "16px 8px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item, idx) => {
            const isActive = activePath === item.path;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(item.path)}
                style={{
                  height: "36px",
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  gap: "12px",
                  cursor: "pointer",
                  backgroundColor: isActive ? "rgba(37, 99, 235, 0.08)" : "transparent",
                  color: isActive ? "var(--color-accent-solid)" : "var(--color-text-primary)",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13px",
                  transition: "background-color 100ms var(--motion-ease)"
                }}
              >
                <Icon name={item.icon} size={16} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          style={{
            padding: "12px",
            borderTop: "1px solid var(--color-border-subtle)",
            display: "flex",
            justifyContent: sidebarCollapsed ? "center" : "flex-end"
          }}
        >
          <BaseIconButton
            icon={sidebarCollapsed ? "chevron-right" : "chevron-left"}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            size="sm"
            variant="ghost"
          />
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Topbar */}
        <header
          style={{
            height: "56px",
            borderBottom: "1px solid var(--color-border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px"
          }}
        >
          {/* Breadcrumbs */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: "var(--color-text-muted)" }}>/</span>}
                <span
                  style={{
                    color: idx === breadcrumbs.length - 1 ? "var(--color-text-primary)" : "var(--color-text-muted)",
                    fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400
                  }}
                >
                  {crumb}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Quick Actions / Search */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 8px",
                backgroundColor: "var(--color-bg-secondary)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "var(--color-text-muted)",
                cursor: "pointer"
              }}
            >
              <Icon name="search" size={14} />
              <span>Search...</span>
              <kbd style={{ fontSize: "10px", backgroundColor: "var(--color-border-subtle)", padding: "1px 4px", borderRadius: "2px" }}>
                ⌘K
              </kbd>
            </div>

            {rightPanel && (
              <BaseIconButton
                icon="menu"
                size="sm"
                variant={rightPanelOpen ? "primary" : "secondary"}
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
              />
            )}
          </div>
        </header>

        {/* Content Body */}
        <div style={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
          {/* Main Content Area */}
          <main style={{ flexGrow: 1, overflowY: "auto", padding: "var(--spacing-lg)" }}>{children}</main>

          {/* Context Panel */}
          {rightPanel && rightPanelOpen && (
            <aside
              style={{
                width: "280px",
                borderLeft: "1px solid var(--color-border-subtle)",
                backgroundColor: "var(--color-bg-secondary)",
                overflowY: "auto",
                padding: "var(--spacing-md)"
              }}
            >
              {rightPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
