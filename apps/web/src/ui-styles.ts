export const ui = {
  // ── Signed-out page ──────────────────────────────────────────────────────
  signedOutPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "Inter, sans-serif",
  },
  signedOutInner: {
    maxWidth: 420,
    width: "100%",
    padding: "0 20px",
  },
  signedOutTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.03em",
    marginBottom: 4,
  },
  signedOutSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 0,
    marginBottom: 28,
  },

  // ── Authenticated shell ───────────────────────────────────────────────────
  shell: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    fontFamily: "Inter, sans-serif",
    background: "#f8fafc",
  },

  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebar: {
    width: 220,
    minWidth: 220,
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
  },
  sidebarHeader: {
    padding: "20px 20px 14px",
    borderBottom: "1px solid #f1f5f9",
  },
  sidebarAppName: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  sidebarEmail: {
    fontSize: 12,
    color: "#94a3b8",
    margin: "4px 0 0",
    overflow: "hidden" as const,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  navList: {
    flex: 1,
    padding: "8px 0",
    listStyle: "none",
    margin: 0,
    overflowY: "auto" as const,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 20px",
    fontSize: 14,
    color: "#374151",
    cursor: "pointer",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left" as const,
    borderLeft: "3px solid transparent",
    fontFamily: "inherit",
    textDecoration: "none",
  },
  navItemActive: {
    color: "#2563eb",
    background: "#eff6ff",
    borderLeft: "3px solid #2563eb",
    fontWeight: 600,
  },
  navItemDisabled: {
    color: "#cbd5e1",
    cursor: "not-allowed" as const,
  },
  navBadge: {
    fontSize: 10,
    background: "#f1f5f9",
    color: "#94a3b8",
    borderRadius: 4,
    padding: "1px 5px",
    marginLeft: "auto",
    fontWeight: 500,
  },
  sidebarFooter: {
    padding: "12px 20px",
    borderTop: "1px solid #f1f5f9",
  },
  signOutBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: 13,
    cursor: "pointer",
    padding: 0,
    fontFamily: "inherit",
  },

  // ── Main content ──────────────────────────────────────────────────────────
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    minWidth: 0,
    overflowY: "auto" as const,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "0 24px",
    height: 56,
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    flexShrink: 0,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
    flex: 1,
    letterSpacing: "-0.02em",
  },
  topBarSearch: {
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "7px 12px",
    fontSize: 13,
    background: "#f8fafc",
    width: 240,
    fontFamily: "inherit",
  },
  mainBody: {
    padding: 24,
    flex: 1,
  },

  // ── Right aside (post-MVP) ────────────────────────────────────────────────
  rightAside: {
    width: 300,
    minWidth: 300,
    background: "#f8fafc",
    borderLeft: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    flexShrink: 0,
  },
  asidePlaceholder: {
    border: "1.5px dashed #cbd5e1",
    borderRadius: 12,
    padding: "32px 24px",
    textAlign: "center" as const,
    width: "100%",
  },
  asidePlaceholderTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#94a3b8",
    margin: "0 0 6px",
  },
  asidePlaceholderText: {
    fontSize: 12,
    color: "#cbd5e1",
    margin: "0 0 12px",
  },
  postMvpBadge: {
    display: "inline-block",
    fontSize: 11,
    background: "#fed7aa",
    color: "#92400e",
    borderRadius: 4,
    padding: "2px 7px",
    fontWeight: 500,
  },

  // ── Feedback banner ───────────────────────────────────────────────────────
  feedbackBanner: {
    padding: "10px 24px",
    fontSize: 13,
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },

  // ── Legacy / shared form primitives ──────────────────────────────────────
  page: {
    maxWidth: 760,
    margin: "24px auto",
    fontFamily: "Inter, sans-serif",
    padding: "0 12px",
  },
  title: {
    marginBottom: 6,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    marginTop: 0,
    color: "#475569",
    fontSize: 14,
  },
  row: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  radioRow: {
    marginBottom: 10,
    display: "flex",
    gap: 14,
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  sectionHint: {
    marginTop: 0,
    color: "#64748b",
    fontSize: 13,
  },
  input: {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "9px 10px",
    background: "#ffffff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: 14,
  },
  compactInput: {
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "9px 10px",
    background: "#ffffff",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
    fontSize: 14,
  },
  primaryButton: {
    border: "1px solid #1d4ed8",
    background: "#1d4ed8",
    color: "#ffffff",
    borderRadius: 10,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
  },
  secondaryButton: {
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    color: "#374151",
    borderRadius: 10,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 14,
  },
};

export function feedbackColor(tone: "error" | "success" | "info") {
  if (tone === "error") return "#b91c1c";
  if (tone === "success") return "#166534";
  return "#0f766e";
}
