import { create } from 'zustand';

interface DateState {
    selectedMonth: number;
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
}

const currentDate = new Date();

export const useDateStore = create<DateState>((set) => ({
    selectedMonth: currentDate.getMonth(),
    selectedYear: currentDate.getFullYear(),
    setSelectedMonth: (month) => set({ selectedMonth: month }),
    setSelectedYear: (year) => set({ selectedYear: year }),
}));
