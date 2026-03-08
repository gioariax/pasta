import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings, updateSettings, type Category } from '../services/api';
import { useAuth } from './AuthContext';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Housing', type: 'expense', icon: 'FiHome' },
    { id: '2', name: 'Food & Groceries', type: 'expense', icon: 'FiShoppingBag' },
    { id: '3', name: 'Utilities', type: 'expense', icon: 'FiZap' },
    { id: '4', name: 'Transportation', type: 'expense', icon: 'FiTruck' },
    { id: '5', name: 'Entertainment', type: 'expense', icon: 'FiFilm' },
    { id: '6', name: 'Health', type: 'expense', icon: 'FiHeart' },
    { id: '7', name: 'Shopping', type: 'expense', icon: 'FiShoppingCart' },
    { id: '8', name: 'Other Expense', type: 'expense', icon: 'FiMoreHorizontal' },
    { id: '9', name: 'Salary', type: 'income', icon: 'FiDollarSign' },
    { id: '10', name: 'Freelance', type: 'income', icon: 'FiBriefcase' },
    { id: '11', name: 'Investments', type: 'income', icon: 'FiTrendingUp' },
    { id: '12', name: 'Gifts', type: 'income', icon: 'FiGift' },
    { id: '13', name: 'Other Income', type: 'income', icon: 'FiPlus' },
];

const DEFAULT_WIDGETS: Record<string, boolean> = {
    balance: true,
    incomeExpense: true,
    projected: true,
    suggested: true,
    budgets: true,
    expenseDistribution: true,
    incomeVsExpense: true,
    burnRate: true,
    cashFlow: true,
    heatmap: true,
};

export const DEFAULT_LAYOUT: string[] = [
    'balance',
    'incomeExpense',
    'projected',
    'expenseDistribution',
    'incomeVsExpense',
    'burnRate',
    'cashFlow',
    'heatmap',
    'suggested',
    'budgets'
];

interface SettingsContextType {
    categories: Category[];
    dashboardWidgets: Record<string, boolean>;
    dashboardLayout: string[];
    saveCategories: (newCategories: Category[]) => Promise<void>;
    saveWidgets: (newWidgets: Record<string, boolean>) => Promise<void>;
    saveLayout: (newLayout: string[]) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
    const [dashboardWidgets, setDashboardWidgets] = useState<Record<string, boolean>>(DEFAULT_WIDGETS);
    const [dashboardLayout, setDashboardLayout] = useState<string[]>(DEFAULT_LAYOUT);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            loadSettings();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const data = await fetchSettings();
            if (data.categories && data.categories.length > 0) {
                setCategories(data.categories);
            } else {
                setCategories(DEFAULT_CATEGORIES);
            }
            if (data.dashboardWidgets) {
                setDashboardWidgets({ ...DEFAULT_WIDGETS, ...data.dashboardWidgets });
            } else {
                setDashboardWidgets(DEFAULT_WIDGETS);
            }
            if (data.dashboardLayout && data.dashboardLayout.length > 0) {
                // Migration: Replace 'charts' string with the 5 discrete chart components gracefully
                let finalLayout: string[] = [];
                for (const item of data.dashboardLayout) {
                    if (item === 'charts') {
                        finalLayout.push('expenseDistribution', 'incomeVsExpense', 'burnRate', 'cashFlow', 'heatmap');
                    } else {
                        finalLayout.push(item);
                    }
                }
                // Deduplicate just in case
                finalLayout = Array.from(new Set(finalLayout));
                setDashboardLayout(finalLayout);
            } else {
                setDashboardLayout(DEFAULT_LAYOUT);
            }
        } catch (error) {
            console.error('Failed to load settings', error);
            // Fallback to default
            setCategories(DEFAULT_CATEGORIES);
            setDashboardWidgets(DEFAULT_WIDGETS);
            setDashboardLayout(DEFAULT_LAYOUT);
        } finally {
            setLoading(false);
        }
    };

    const saveCategories = async (newCategories: Category[]) => {
        try {
            setCategories(newCategories); // Optimistic UI update
            await updateSettings({ categories: newCategories, dashboardWidgets, dashboardLayout });
        } catch (error) {
            console.error('Failed to save settings', error);
            // Rollback on failure could be implemented here
        }
    };

    const saveWidgets = async (newWidgets: Record<string, boolean>) => {
        try {
            setDashboardWidgets(newWidgets);
            await updateSettings({ categories, dashboardWidgets: newWidgets, dashboardLayout });
        } catch (error) {
            console.error('Failed to save settings widgets', error);
        }
    };

    const saveLayout = async (newLayout: string[]) => {
        try {
            setDashboardLayout(newLayout);
            await updateSettings({ categories, dashboardWidgets, dashboardLayout: newLayout });
        } catch (error) {
            console.error('Failed to save settings layout', error);
        }
    };

    return (
        <SettingsContext.Provider value={{ categories, dashboardWidgets, dashboardLayout, saveCategories, saveWidgets, saveLayout, loading }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
