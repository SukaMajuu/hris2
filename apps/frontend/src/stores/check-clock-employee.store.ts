import { create } from "zustand";
import { CheckClockEmployeeEntry } from "@/types/check-clock-employee.types";

interface CheckClockEmployeeState {
    selectedEntry: CheckClockEmployeeEntry | null;
    isEntryDialogOpen: boolean; // For add/edit dialog
    dialogMode: "add" | "edit";

    setSelectedEntry: (entry: CheckClockEmployeeEntry | null) => void;
    openDialog: (mode: "add" | "edit", entry?: CheckClockEmployeeEntry | null) => void;
    closeDialog: () => void;
}

export const useCheckClockEmployeeStore = create<CheckClockEmployeeState>((set) => ({
    selectedEntry: null,
    isEntryDialogOpen: false,
    dialogMode: "add",

    setSelectedEntry: (entry) => set({ selectedEntry: entry }),
    openDialog: (mode, entry = null) => set({
        isEntryDialogOpen: true,
        dialogMode: mode,
        selectedEntry: mode === "edit" ? entry : null,
    }),
    closeDialog: () => set({
        isEntryDialogOpen: false,
        selectedEntry: null,
    }),
}));