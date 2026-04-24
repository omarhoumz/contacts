export const SIDEBAR_W = 220;
export const SIDEBAR_W_COLLAPSED = 48;
export type ThemeMode = "light" | "dark";

const LIGHT_THEME = {
  "--bg-app": "#f8fafc",
  "--bg-surface": "#ffffff",
  "--bg-subtle": "#f8fafc",
  "--bg-card": "#ffffff",
  "--border-strong": "#e2e8f0",
  "--border-soft": "#f1f5f9",
  "--text-primary": "#0f172a",
  "--text-secondary": "#374151",
  "--text-muted": "#64748b",
  "--text-subtle": "#94a3b8",
};

const DARK_THEME = {
  "--bg-app": "#020617",
  "--bg-surface": "#0f172a",
  "--bg-subtle": "#111827",
  "--bg-card": "#0b1220",
  "--border-strong": "#334155",
  "--border-soft": "#1e293b",
  "--text-primary": "#e2e8f0",
  "--text-secondary": "#cbd5e1",
  "--text-muted": "#94a3b8",
  "--text-subtle": "#64748b",
};

export function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = mode === "dark" ? DARK_THEME : LIGHT_THEME;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}

export const ui = {
  // ── Signed-out page ──────────────────────────────────────────────────────
  signedOutPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--bg-app)",
  },
  signedOutInner: {
    maxWidth: 400,
    width: "100%",
    padding: "0 20px",
  },
  signedOutTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "var(--text-primary)",
    letterSpacing: "-0.03em",
    marginBottom: 4,
  },
  signedOutSubtitle: {
    fontSize: 14,
    color: "var(--text-muted)",
    marginTop: 0,
    marginBottom: 28,
  },
  signedOutCard: {
    background: "var(--bg-surface)",
    border: "1px solid var(--border-strong)",
    borderRadius: 14,
    padding: "24px 20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  },

  // ── Authenticated shell ───────────────────────────────────────────────────
  shell: {
    minHeight: "100vh",
    background: "var(--bg-app)",
    transition: "margin-inline-start 0.2s ease",
  },

  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebar: {
    position: "fixed" as const,
    top: 0,
    insetInlineStart: 0,
    height: "100vh",
    zIndex: 30,
    background: "var(--bg-surface)",
    borderInlineEnd: "1px solid var(--border-strong)",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    transition: "width 0.2s ease",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    paddingBlock: "20px 14px",
    paddingInline: 20,
    borderBottom: "1px solid var(--border-soft)",
    flexShrink: 0,
    overflow: "hidden",
  },
  sidebarHeaderCollapsed: {
    justifyContent: "center",
    paddingInline: 0,
  },
  sidebarBranding: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
  },
  sidebarAppName: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    letterSpacing: "-0.03em",
    whiteSpace: "nowrap" as const,
  },
  sidebarEmail: {
    fontSize: 12,
    color: "var(--text-subtle)",
    margin: "4px 0 0",
    overflow: "hidden" as const,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  sidebarToggleBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-subtle)",
    padding: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    flexShrink: 0,
    lineHeight: 0,
  },
  navList: {
    flex: 1,
    padding: "6px 0",
    listStyle: "none",
    margin: 0,
    flexShrink: 1,
    overflow: "hidden",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    paddingBlock: 12,
    paddingInlineStart: 20,
    paddingInlineEnd: 16,
    fontSize: 14,
    color: "var(--text-secondary)",
    cursor: "pointer",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "start" as const,
    borderInlineStart: "3px solid transparent",
    fontFamily: "inherit",
    textDecoration: "none",
    lineHeight: 1.4,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
  },
  navItemCollapsed: {
    justifyContent: "center",
    paddingInline: 0,
    gap: 0,
  },
  navItemActive: {
    color: "#2563eb",
    background: "#eff6ff",
    borderInlineStart: "3px solid #2563eb",
    fontWeight: 600,
  },
  navItemDisabled: {
    cursor: "default" as const,
    pointerEvents: "none" as const,
  },
  sidebarFooter: {
    paddingBlock: 12,
    paddingInline: 20,
    borderTop: "1px solid var(--border-soft)",
    flexShrink: 0,
  },
  sidebarFooterCollapsed: {
    paddingInline: 0,
    display: "flex",
    justifyContent: "center",
  },
  signOutBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },

  // ── Main content ──────────────────────────────────────────────────────────
  mainContent: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 24px",
    height: 56,
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--border-strong)",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary)",
    margin: 0,
    flex: 1,
    letterSpacing: "-0.03em",
  },
  searchWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute" as const,
    insetInlineEnd: 10,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-subtle)",
    pointerEvents: "none" as const,
    display: "flex",
  },
  topBarSearch: {
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "7px 34px 7px 12px",
    fontSize: 13,
    background: "var(--bg-subtle)",
    width: 280,
    fontFamily: "inherit",
    color: "var(--text-primary)",
    outline: "none",
  },
  composeSection: {
    padding: "14px 24px",
    background: "var(--bg-subtle)",
    borderBottom: "1px solid var(--border-strong)",
    flexShrink: 0,
  },
  composeSectionTitle: {
    margin: "0 0 10px",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  mainBody: {
    padding: 24,
    flex: 1,
  },

  // ── List card ─────────────────────────────────────────────────────────────
  listCard: {
    background: "var(--bg-card)",
    borderRadius: 8,
    boxShadow: "0 1px 4px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  listCardFooter: {
    padding: "10px 16px",
    fontSize: 13,
    color: "var(--text-subtle)",
    borderTop: "1px solid var(--border-soft)",
  },
  contactRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 16px",
    height: 48,
    borderBottom: "1px solid var(--border-soft)",
  },
  contactRowActions: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 16px 12px 60px",
    borderBottom: "1px solid var(--border-soft)",
    flexWrap: "wrap" as const,
    gap2: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
    letterSpacing: "0.01em",
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "6px 8px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    borderRadius: 6,
    fontFamily: "inherit",
    flexShrink: 0,
  },

  // ── Feedback banner ───────────────────────────────────────────────────────
  feedbackBanner: {
    padding: "10px 24px",
    fontSize: 13,
    borderBottom: "1px solid var(--border-strong)",
    flexShrink: 0,
  },

  // ── Form primitives ───────────────────────────────────────────────────────
  input: {
    width: "100%",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "9px 12px",
    background: "var(--bg-surface)",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
  },
  compactInput: {
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    padding: "8px 12px",
    background: "var(--bg-surface)",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: 14,
    color: "var(--text-primary)",
    outline: "none",
  },
  primaryButton: {
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#ffffff",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  },
  secondaryButton: {
    border: "1px solid var(--border-strong)",
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  },
  smallButton: {
    border: "1px solid var(--border-strong)",
    background: "var(--bg-subtle)",
    color: "var(--text-secondary)",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 12,
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  },

  // ── Labels ────────────────────────────────────────────────────────────────
  labelPill: {
    fontSize: 11,
    borderRadius: 999,
    paddingBlock: "2px",
    paddingInline: "8px",
    fontWeight: 500,
    whiteSpace: "nowrap" as const,
  },

  // ── Legacy tokens (kept for signed-out / manage-labels usage) ─────────────
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  sectionHint: {
    marginTop: 0,
    color: "var(--text-muted)",
    fontSize: 13,
  },
};

export function feedbackColor(tone: "error" | "success" | "info") {
  if (tone === "error") return "#b91c1c";
  if (tone === "success") return "#166534";
  return "#0f766e";
}
