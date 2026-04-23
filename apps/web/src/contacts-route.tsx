import { useEffect } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { LabelsSection } from "./labels-section";
import { ui } from "./ui-styles";

export function ContactsRoute() {
  const s = useWebApp();

  useEffect(() => {
    s.setShowTrash(false);
    void s.refreshData(false);
  }, []);

  return (
    <div style={ui.mainBody}>
      <ContactsSection
        showTrash={false}
        query={s.query}
        setQuery={s.setQuery}
        dataBusy={s.dataBusy}
        displayName={s.displayName}
        setDisplayName={s.setDisplayName}
        mutationBusy={s.mutationBusy}
        editingId={s.editingId}
        setEditingId={s.setEditingId}
        createContact={s.createContact}
        updateContact={s.updateContact}
        refreshData={s.refreshData}
        displayedContacts={s.displayedContacts}
        labels={s.labels}
        softDeleteContact={s.softDeleteContact}
        restoreContact={s.restoreContact}
        permanentlyDeleteContact={s.permanentlyDeleteContact}
        toggleContactLabel={s.toggleContactLabel}
      />

      <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "28px 0 20px" }} />

      <LabelsSection
        labels={s.labels}
        newLabelName={s.newLabelName}
        setNewLabelName={s.setNewLabelName}
        newLabelColor={s.newLabelColor}
        setNewLabelColor={s.setNewLabelColor}
        createLabel={s.createLabel}
        labelBusy={s.labelBusy}
        dataBusy={s.dataBusy}
      />
    </div>
  );
}
