import * as React from "react";
import { Icon, IconName } from "./icons.js";

// --- BaseButton ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const BaseButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "secondary", size = "md", children, style, ...props }, ref) => {
    const isPrimary = variant === "primary";
    const isDanger = variant === "danger";
    const isGhost = variant === "ghost";

    const getBgColor = () => {
      if (isPrimary) return "var(--color-accent-solid)";
      if (isDanger) return "var(--color-error-text)";
      if (isGhost) return "transparent";
      return "var(--color-bg-secondary)";
    };

    const getBorder = () => {
      if (isGhost) return "none";
      if (isPrimary || isDanger) return "none";
      return "1px solid var(--color-border-subtle)";
    };

    const getPadding = () => {
      if (size === "sm") return "4px 8px";
      if (size === "lg") return "10px 20px";
      return "6px 12px";
    };

    const getFontSize = () => {
      if (size === "sm") return "12px";
      if (size === "lg") return "15px";
      return "13px";
    };

    return (
      <button
        ref={ref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          padding: getPadding(),
          backgroundColor: getBgColor(),
          border: getBorder(),
          borderRadius: "var(--radius-md)",
          color: isGhost
            ? "var(--color-text-primary)"
            : isPrimary || isDanger
              ? "#ffffff"
              : "var(--color-text-primary)",
          fontSize: getFontSize(),
          fontWeight: 500,
          cursor: "pointer",
          transition: "background-color 100ms var(--motion-ease), transform 100ms var(--motion-ease)",
          ...style
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
BaseButton.displayName = "BaseButton";

// --- BaseIconButton ---
export interface IconButtonProps extends ButtonProps {
  icon: IconName;
}

export const BaseIconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = "md", ...props }, ref) => {
    return (
      <BaseButton
        ref={ref}
        size={size}
        style={{
          padding: size === "sm" ? "4px" : size === "lg" ? "8px" : "6px",
          borderRadius: "50%"
        }}
        {...props}
      >
        <Icon name={icon} size={size === "sm" ? "xs" : size === "lg" ? "lg" : "md"} />
      </BaseButton>
    );
  }
);
BaseIconButton.displayName = "BaseIconButton";

// --- BaseCard ---
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const BaseCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--spacing-md)",
          transition: "border-color 150ms var(--motion-ease), transform 150ms var(--motion-ease)",
          cursor: hoverable ? "pointer" : "default",
          ...style
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
BaseCard.displayName = "BaseCard";

// --- BaseBadge ---
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "info" | "success" | "warning" | "error";
}

export const BaseBadge: React.FC<BadgeProps> = ({ variant = "info", children, style, ...props }) => {
  const getColors = () => {
    switch (variant) {
      case "success":
        return { bg: "rgba(16, 185, 129, 0.1)", text: "var(--color-success-text)" };
      case "warning":
        return { bg: "rgba(245, 158, 11, 0.1)", text: "var(--color-warning-text)" };
      case "error":
        return { bg: "rgba(244, 63, 94, 0.1)", text: "var(--color-error-text)" };
      default:
        return { bg: "rgba(37, 99, 235, 0.1)", text: "var(--color-accent-solid)" };
    }
  };

  const { bg, text } = getColors();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 6px",
        borderRadius: "var(--radius-sm)",
        fontSize: "11px",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        backgroundColor: bg,
        color: text,
        ...style
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// --- BaseChip / BaseTag ---
export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export const BaseTag: React.FC<TagProps> = ({ onRemove, children, style, ...props }) => {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "2px 8px",
        backgroundColor: "var(--color-bg-primary)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "9999px",
        fontSize: "12px",
        color: "var(--color-text-primary)",
        ...style
      }}
      {...props}
    >
      {children}
      {onRemove && (
        <span
          onClick={onRemove}
          style={{
            display: "inline-flex",
            alignItems: "center",
            cursor: "pointer",
            opacity: 0.6
          }}
        >
          <Icon name="x" size={10} />
        </span>
      )}
    </span>
  );
};

// --- Input Controls ---
export const BaseLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  style,
  ...props
}) => {
  return (
    <label
      style={{
        display: "block",
        fontSize: "12px",
        fontWeight: 600,
        marginBottom: "var(--spacing-xxs)",
        color: "var(--color-text-muted)",
        ...style
      }}
      {...props}
    >
      {children}
    </label>
  );
};

export const BaseInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        style={{
          width: "100%",
          padding: "6px 10px",
          fontSize: "13px",
          backgroundColor: "var(--color-bg-primary)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text-primary)",
          outline: "none",
          transition: "border-color 100ms var(--motion-ease)",
          ...style
        }}
        {...props}
      />
    );
  }
);
BaseInput.displayName = "BaseInput";

export const BaseTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ style, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      style={{
        width: "100%",
        padding: "6px 10px",
        fontSize: "13px",
        backgroundColor: "var(--color-bg-primary)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        color: "var(--color-text-primary)",
        outline: "none",
        minHeight: "80px",
        transition: "border-color 100ms var(--motion-ease)",
        ...style
      }}
      {...props}
    />
  );
});
BaseTextarea.displayName = "BaseTextarea";

export const BaseSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ children, style, ...props }, ref) => {
  return (
    <select
      ref={ref}
      style={{
        width: "100%",
        padding: "6px 10px",
        fontSize: "13px",
        backgroundColor: "var(--color-bg-primary)",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        color: "var(--color-text-primary)",
        outline: "none",
        cursor: "pointer",
        ...style
      }}
      {...props}
    >
      {children}
    </select>
  );
});
BaseSelect.displayName = "BaseSelect";

export const BaseCheckbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ children, style, ...props }, ref) => {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
      <input
        ref={ref}
        type="checkbox"
        style={{
          width: "14px",
          height: "14px",
          accentColor: "var(--color-accent-solid)",
          ...style
        }}
        {...props}
      />
      <span style={{ fontSize: "13px" }}>{children}</span>
    </label>
  );
});
BaseCheckbox.displayName = "BaseCheckbox";

export const BaseSwitch = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ checked, ...props }, ref) => {
    return (
      <label style={{ display: "inline-flex", alignItems: "center", cursor: "pointer", position: "relative" }}>
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          style={{ display: "none" }}
          {...props}
        />
        <div
          style={{
            width: "34px",
            height: "18px",
            backgroundColor: checked ? "var(--color-accent-solid)" : "var(--color-border-subtle)",
            borderRadius: "9px",
            position: "relative",
            transition: "background-color 150ms var(--motion-ease)"
          }}
        >
          <div
            style={{
              width: "14px",
              height: "14px",
              backgroundColor: "white",
              borderRadius: "50%",
              position: "absolute",
              top: "2px",
              left: checked ? "18px" : "2px",
              transition: "left 150ms var(--motion-ease)"
            }}
          />
        </div>
      </label>
    );
  }
);
BaseSwitch.displayName = "BaseSwitch";

// --- BaseFormField ---
export interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export const BaseFormField: React.FC<FormFieldProps> = ({ label, error, children }) => {
  return (
    <div style={{ marginBottom: "var(--spacing-sm)" }}>
      <BaseLabel>{label}</BaseLabel>
      {children}
      {error && (
        <span
          style={{
            display: "block",
            fontSize: "11px",
            color: "var(--color-error-text)",
            marginTop: "2px"
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

// --- BaseSpinner ---
export const BaseSpinner: React.FC = () => {
  return (
    <div
      className="pos-skeleton"
      style={{
        width: "20px",
        height: "20px",
        borderRadius: "50%",
        border: "2px solid var(--color-border-subtle)",
        borderTopColor: "var(--color-accent-solid)",
        animation: "pos-pulse 1000ms linear infinite"
      }}
    />
  );
};

// --- BaseSkeleton ---
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: "text" | "rect" | "circle";
  style?: React.CSSProperties;
}

export const BaseSkeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "16px",
  variant = "rect",
  style
}) => {
  return (
    <div
      className="pos-skeleton"
      style={{
        width,
        height,
        borderRadius: variant === "circle" ? "50%" : variant === "text" ? "var(--radius-sm)" : "var(--radius-md)",
        ...style
      }}
    />
  );
};

// --- BaseProgress ---
export interface ProgressProps {
  value: number; // 0 to 100
  style?: React.CSSProperties;
}

export const BaseProgress: React.FC<ProgressProps> = ({ value, style }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "6px",
        backgroundColor: "var(--color-border-subtle)",
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        ...style
      }}
    >
      <div
        style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: "var(--color-accent-solid)",
          transition: "width 200ms var(--motion-ease)"
        }}
      />
    </div>
  );
};

// --- EmptyState / ErrorState / LoadingState ---
export interface StateProps {
  title: string;
  description: string;
  icon?: IconName;
}

export const BaseEmptyState: React.FC<StateProps> = ({ title, description, icon = "info" }) => {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        border: "1px dashed var(--color-border-subtle)",
        borderRadius: "var(--radius-lg)"
      }}
    >
      <Icon name={icon} size={28} style={{ color: "var(--color-text-muted)", marginBottom: "12px" }} />
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{title}</h4>
      <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{description}</p>
    </div>
  );
};

export const BaseErrorState: React.FC<StateProps> = ({ title, description, icon = "alert" }) => {
  return (
    <div
      style={{
        padding: "40px",
        textAlign: "center",
        border: "1px solid var(--color-error-text)",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "rgba(244, 63, 94, 0.05)"
      }}
    >
      <Icon name={icon} size={28} style={{ color: "var(--color-error-text)", marginBottom: "12px" }} />
      <h4 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px", color: "var(--color-error-text)" }}>
        {title}
      </h4>
      <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{description}</p>
    </div>
  );
};

export const BaseLoadingState: React.FC<{ label?: string }> = ({ label = "Loading contents..." }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "40px" }}>
      <BaseSpinner />
      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{label}</span>
    </div>
  );
};

// --- BasePagination ---
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const BasePagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end", marginTop: "12px" }}>
      <BaseButton
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </BaseButton>
      <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>
        Page {currentPage} of {totalPages}
      </span>
      <BaseButton
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </BaseButton>
    </div>
  );
};

// --- BaseDataTable Foundation ---
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
}

export function BaseDataTable<T>({ columns, data }: DataTableProps<T>) {
  return (
    <div
      style={{
        overflowX: "auto",
        border: "1px solid var(--color-border-subtle)",
        borderRadius: "var(--radius-md)",
        backgroundColor: "var(--color-bg-primary)"
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border-subtle)", backgroundColor: "var(--color-bg-secondary)" }}>
            {columns.map((col, idx) => (
              <th key={idx} style={{ padding: "8px 12px", fontWeight: 600, color: "var(--color-text-muted)" }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} style={{ borderBottom: "1px solid var(--color-border-subtle)" }}>
              {columns.map((col, colIdx) => (
                <td key={colIdx} style={{ padding: "8px 12px" }}>
                  {col.render ? col.render(row) : String(row[col.key as keyof T] || "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- BaseAccordion ---
export interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export const BaseAccordion: React.FC<{ items: AccordionItem[] }> = ({ items }) => {
  const [openIdx, setOpenIdx] = React.useState<number | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {items.map((item, idx) => {
        const isOpen = openIdx === idx;
        return (
          <div
            key={idx}
            style={{
              border: "1px solid var(--color-border-subtle)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden"
            }}
          >
            <div
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--color-bg-secondary)",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 600,
                fontSize: "13px"
              }}
            >
              {item.title}
              <Icon name="chevron-down" size={12} style={{ transform: isOpen ? "rotate(180deg)" : "none" }} />
            </div>
            {isOpen && (
              <div style={{ padding: "14px", fontSize: "13px", backgroundColor: "var(--color-bg-primary)" }}>
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
