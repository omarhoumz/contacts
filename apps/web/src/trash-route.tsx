import { useEffect } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { ui } from "./ui-styles";

export function TrashRoute() {
  const s = useWebApp();

  useEffect(() => {
    s.setShowTrash(true);
    void s.refreshData(true);
  }, []);

  return (
    <div style={ui.mainBody}>
      <ContactsSection
        showTrash={true}
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
    </div>
  );
}
