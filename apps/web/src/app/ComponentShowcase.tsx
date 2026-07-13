import * as React from "react";
import {
  useSettings,
  useToast,
  useModal,
  BaseButton,
  BaseIconButton,
  BaseCard,
  BaseBadge,
  BaseTag,
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseCheckbox,
  BaseSwitch,
  BaseFormField,
  BaseProgress,
  BaseEmptyState,
  BaseErrorState,
  BaseLoadingState,
  BasePagination,
  BaseDataTable,
  BaseAccordion,
  BaseFlex,
  BaseStack,
  BaseGrid,
  BaseSplitView,
  Column
} from "@placementos/ui";

interface LogEntry {
  timestamp: string;
  action: string;
  status: "success" | "warning" | "error";
  duration: string;
}

const mockLogs: LogEntry[] = [
  { timestamp: "01:14:02", action: "Execute Database Seeder 'MockSeeder'", status: "success", duration: "1ms" },
  { timestamp: "01:14:05", action: "Run typecheck verification", status: "success", duration: "1.2s" },
  { timestamp: "01:14:15", action: "LCA of Binary Tree Practice Attempt", status: "warning", duration: "45m" },
  { timestamp: "01:14:22", action: "Express Graceful Shutdown Hook", status: "error", duration: "10s" }
];

export function ComponentShowcase() {
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();
  const { openModal } = useModal();

  const [inputValue, setInputValue] = React.useState("");
  const [selectValue, setSelectValue] = React.useState("easy");
  const [checkboxValue, setCheckboxValue] = React.useState(true);
  const [switchValue, setSwitchValue] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const columns: Column<LogEntry>[] = [
    {
      key: "timestamp",
      header: "Timestamp",
      render: (row) => <span style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}>{row.timestamp}</span>
    },
    { key: "action", header: "Action log" },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <BaseBadge variant={row.status === "success" ? "success" : row.status === "warning" ? "warning" : "error"}>
          {row.status.toUpperCase()}
        </BaseBadge>
      )
    },
    {
      key: "duration",
      header: "Duration",
      render: (row) => <span style={{ fontFamily: "var(--font-mono)" }}>{row.duration}</span>
    }
  ];

  const handleShowToast = (type: "success" | "info" | "warning" | "error") => {
    showToast(`This is a high-density ${type} notification banner.`, type);
  };

  const handleOpenModal = () => {
    openModal({
      title: "Confirm Infrastructure Migration",
      content: "Are you sure you want to promote the Shared UI foundation registry to production? All consumer microfrontends will pull variables dynamically.",
      confirmLabel: "Apply Settings",
      cancelLabel: "Discard",
      onConfirm: () => showToast("Dynamic UI layout configurations stored successfully.", "success")
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
      {/* Top Welcome Card */}
      <BaseCard style={{ background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(16, 185, 129, 0.05))" }}>
        <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px", letterSpacing: "-0.5px" }}>
          Shared UI Foundation & Customizer
        </h2>
        <p style={{ fontSize: "13px", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
          Welcome to the PlacementOS component suite playground. Customize design tokens in the side panel or below to see how themes, accent colors, border-radii, and layout densities propagate across every component.
        </p>
      </BaseCard>

      {/* Grid of Customizer and Basic components */}
      <BaseGrid cols={2}>
        {/* Design System Settings Panel */}
        <BaseCard>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
            Design Token Customizer
          </h3>
          <BaseStack gap="var(--spacing-sm)">
            <BaseFormField label="Theme Mode">
              <BaseSelect
                value={settings.themeMode}
                onChange={(e) => updateSettings({ themeMode: e.target.value as "light" | "dark" | "system" })}
              >
                <option value="light">Light Mode (Zinc 100 / White)</option>
                <option value="dark">Dark Mode (Zinc 950 / 900)</option>
                <option value="system">System Preference</option>
              </BaseSelect>
            </BaseFormField>

            <BaseFormField label="Accent Scale Color">
              <BaseSelect
                value={settings.accentScale}
                onChange={(e) => updateSettings({ accentScale: e.target.value as "blue" | "steel" | "emerald" | "gray" })}
              >
                <option value="blue">Slate Developer (Blue)</option>
                <option value="steel">Steel Gray</option>
                <option value="emerald">Forest Console (Emerald)</option>
                <option value="gray">Monochrome Ink (Gray)</option>
              </BaseSelect>
            </BaseFormField>

            <BaseFormField label="Layout Density Mode">
              <BaseSelect
                value={settings.densityMode}
                onChange={(e) => updateSettings({ densityMode: e.target.value as "comfortable" | "condensed" })}
              >
                <option value="comfortable">Comfortable (16px base gaps)</option>
                <option value="condensed">Condensed (12px / 8px density)</option>
              </BaseSelect>
            </BaseFormField>

            <BaseFormField label={`Border Radius Customization (${settings.borderRadiusPx}px)`}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={settings.borderRadiusPx}
                  onChange={(e) => updateSettings({ borderRadiusPx: Number(e.target.value) })}
                  style={{ flexGrow: 1, accentColor: "var(--color-accent-solid)" }}
                />
                <span style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }}>{settings.borderRadiusPx}px</span>
              </div>
            </BaseFormField>
          </BaseStack>
        </BaseCard>

        {/* Buttons Showcase */}
        <BaseCard>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
            Button Variants & Triggers
          </h3>
          <BaseStack gap="var(--spacing-md)">
            <BaseFlex gap="var(--spacing-xs)" style={{ flexWrap: "wrap" }}>
              <BaseButton variant="primary">Primary Action</BaseButton>
              <BaseButton variant="secondary">Secondary Action</BaseButton>
              <BaseButton variant="danger">Danger Log</BaseButton>
              <BaseButton variant="ghost">Ghost link</BaseButton>
            </BaseFlex>

            <BaseFlex gap="var(--spacing-xs)" style={{ flexWrap: "wrap", alignItems: "center" }}>
              <BaseButton size="sm" variant="primary">Small Button</BaseButton>
              <BaseButton size="md" variant="secondary">Medium Button</BaseButton>
              <BaseButton size="lg" variant="secondary">Large Button</BaseButton>
            </BaseFlex>

            <BaseFlex gap="var(--spacing-xs)" style={{ alignItems: "center" }}>
              <BaseIconButton icon="plus" variant="primary" />
              <BaseIconButton icon="settings" variant="secondary" />
              <BaseIconButton icon="activity" variant="ghost" />
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Icon Buttons</span>
            </BaseFlex>

            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Tag / Chip Badges:
            </div>
            <BaseFlex gap="var(--spacing-xs)" style={{ flexWrap: "wrap" }}>
              <BaseTag onRemove={() => showToast("Removed 'Array' tag.", "info")}>Array</BaseTag>
              <BaseTag onRemove={() => showToast("Removed 'Dynamic Programming' tag.", "info")}>Dynamic Programming</BaseTag>
              <BaseTag>Trees</BaseTag>
            </BaseFlex>
          </BaseStack>
        </BaseCard>
      </BaseGrid>

      {/* Form Controls & Feedback Showcase */}
      <BaseGrid cols={2}>
        <BaseCard>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
            Form Fields & State Binding
          </h3>
          <BaseStack gap="var(--spacing-sm)">
            <BaseFormField label="Code/Input search field">
              <BaseInput
                placeholder="Type anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </BaseFormField>

            <BaseFormField label="Selected Difficulty Preference">
              <BaseSelect value={selectValue} onChange={(e) => setSelectValue(e.target.value)}>
                <option value="easy">Easy Level</option>
                <option value="medium">Medium Level</option>
                <option value="hard">Hard Level</option>
              </BaseSelect>
            </BaseFormField>

            <BaseFormField label="Long study note editor">
              <BaseTextarea placeholder="Write markdown details here..." />
            </BaseFormField>

            <BaseFlex gap="var(--spacing-md)" align="center">
              <BaseCheckbox checked={checkboxValue} onChange={(e) => setCheckboxValue(e.target.checked)}>
                Keep session persistent
              </BaseCheckbox>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "13px" }}>Enable Analytics</span>
                <BaseSwitch checked={switchValue} onChange={(e) => setSwitchValue(e.target.checked)} />
              </div>
            </BaseFlex>
          </BaseStack>
        </BaseCard>

        {/* Feedback and Dialog Actions */}
        <BaseCard>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
            Feedback & Programmatic Overlays
          </h3>
          <BaseStack gap="var(--spacing-sm)">
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
              Trigger lightweight, non-blocking toast notifications in bottom-right corner:
            </div>
            <BaseFlex gap="var(--spacing-xs)" style={{ flexWrap: "wrap" }}>
              <BaseButton size="sm" onClick={() => handleShowToast("success")}>Success Toast</BaseButton>
              <BaseButton size="sm" onClick={() => handleShowToast("info")}>Info Toast</BaseButton>
              <BaseButton size="sm" onClick={() => handleShowToast("warning")}>Warning Toast</BaseButton>
              <BaseButton size="sm" onClick={() => handleShowToast("error")}>Error Toast</BaseButton>
            </BaseFlex>

            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "12px", marginBottom: "4px" }}>
              Trigger programmatic, accessible confirmation dialog overlay:
            </div>
            <div>
              <BaseButton variant="primary" onClick={handleOpenModal}>
                Open Confirmation Dialog
              </BaseButton>
            </div>

            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "12px", marginBottom: "4px" }}>
              Accordion Component:
            </div>
            <BaseAccordion
              items={[
                { title: "Design System Guidelines", content: "All UI components follow a strict 4px baseline grid. Accent scales support Slate, Steel, Emerald, and Monochrome." },
                { title: "Keyboard Navigation", content: "Use standard Tab navigation. Interactive components focus with a high contrast border ring." }
              ]}
            />
          </BaseStack>
        </BaseCard>
      </BaseGrid>

      {/* Metrics, Logs, & Grid Tables */}
      <BaseCard>
        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
          High-Density Data Tables & Metrics
        </h3>
        <BaseStack gap="var(--spacing-md)">
          <BaseFlex gap="var(--spacing-md)">
            <div style={{ flex: 1, padding: "12px", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-primary)" }}>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Total Solved Attempts</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", fontFamily: "var(--font-mono)" }}>148</div>
            </div>
            <div style={{ flex: 1, padding: "12px", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-primary)" }}>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginBottom: "4px" }}>Dynamic Practice Rate</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--color-success-text)", marginBottom: "8px" }}>92%</div>
              <BaseProgress value={92} />
            </div>
            <div style={{ flex: 1, padding: "12px", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-primary)" }}>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>Decaying Concepts</div>
              <div style={{ fontSize: "22px", fontWeight: "bold", fontFamily: "var(--font-mono)", color: "var(--color-warning-text)" }}>5</div>
            </div>
          </BaseFlex>

          <BaseDataTable columns={columns} data={mockLogs} />
          <BasePagination currentPage={currentPage} totalPages={5} onPageChange={(page) => setCurrentPage(page)} />
        </BaseStack>
      </BaseCard>

      {/* Layout Split Views Demonstration */}
      <BaseCard style={{ height: "300px", display: "flex", flexDirection: "column" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "12px", borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "6px" }}>
          Workspace Layout Split View Panel (Drag center line to resize)
        </h3>
        <div style={{ flexGrow: 1, border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
          <BaseSplitView
            left={
              <div style={{ padding: "16px" }}>
                <h4 style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>Left: Workspace Editor</h4>
                <pre style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  {`function solveLCA(root, p, q) {
  if (!root || root === p || root === q) return root;
  const left = solveLCA(root.left, p, q);
  const right = solveLCA(root.right, p, q);
  if (left && right) return root;
  return left || right;
}`}
                </pre>
              </div>
            }
            right={
              <div style={{ padding: "16px", backgroundColor: "var(--color-bg-secondary)", height: "100%" }}>
                <h4 style={{ fontWeight: 600, fontSize: "13px", marginBottom: "8px" }}>Right: Editorial notes</h4>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  The lowest common ancestor (LCA) between two nodes p and q is defined as the lowest node in T that has both p and q as descendants (where we allow a node to be a descendant of itself).
                </p>
              </div>
            }
          />
        </div>
      </BaseCard>

      {/* State fallbacks */}
      <BaseGrid cols={3}>
        <BaseEmptyState title="No active job applications" description="Promote companies to your pipeline tracking board." />
        <BaseErrorState title="System Sync Failed" description="Could not load database indices from local storage. Retrying..." />
        <BaseCard style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BaseLoadingState label="Refreshing metrics feed..." />
        </BaseCard>
      </BaseGrid>
    </div>
  );
}
