import React, { createContext, useContext, useState } from 'react';

interface DateContextType {
    selectedMonth: number;
    selectedYear: number;
    setSelectedMonth: (month: number) => void;
    setSelectedYear: (year: number) => void;
}

const DateContext = createContext<DateContextType | null>(null);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

    return (
        <DateContext.Provider value={{ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }}>
            {children}
        </DateContext.Provider>
    );
};

export const useDateContext = () => {
    const context = useContext(DateContext);
    if (!context) {
        throw new Error('useDateContext must be used within a DateProvider');
    }
    return context;
};
