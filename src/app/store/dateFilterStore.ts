import { create } from 'zustand';

export type PeriodType = "mes-corrido" | "ultimos-30" | "ultimos-90" | "personalizado";

interface DateFilterState {
  period: PeriodType;
  customStartDate: string;
  customEndDate: string;
  calendarStartDate: Date | undefined;
  calendarEndDate: Date | undefined;
  
  setPeriod: (period: PeriodType) => void;
  setCustomDates: (startDate: string, endDate: string) => void;
  setCalendarDates: (startDate: Date | undefined, endDate: Date | undefined) => void;
  clearCustomDates: () => void;
}

export const useDateFilterStore = create<DateFilterState>((set) => ({
  period: "mes-corrido",
  customStartDate: "",
  customEndDate: "",
  calendarStartDate: undefined,
  calendarEndDate: undefined,
  
  setPeriod: (period) => set({ period }),
  setCustomDates: (startDate, endDate) => set({ customStartDate: startDate, customEndDate: endDate }),
  setCalendarDates: (startDate, endDate) => set({ calendarStartDate: startDate, calendarEndDate: endDate }),
  clearCustomDates: () => set({ 
    customStartDate: "", 
    customEndDate: "", 
    calendarStartDate: undefined, 
    calendarEndDate: undefined 
  }),
}));

// Utility function to calculate date range
export function getDateRange(
  period: PeriodType,
  customStartDate: string,
  customEndDate: string
): { startDate: Date; endDate: Date } {
  const today = new Date();
  let startDate: Date;
  let endDate: Date = today;

  switch (period) {
    case "mes-corrido":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "ultimos-30":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      break;
    case "ultimos-90":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 90);
      break;
    case "personalizado":
      if (customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      break;
    default:
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  return { startDate, endDate };
}
