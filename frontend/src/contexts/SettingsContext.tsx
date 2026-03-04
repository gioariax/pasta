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

interface SettingsContextType {
    categories: Category[];
    saveCategories: (newCategories: Category[]) => Promise<void>;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
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
        } catch (error) {
            console.error('Failed to load settings', error);
            // Fallback to default
            setCategories(DEFAULT_CATEGORIES);
        } finally {
            setLoading(false);
        }
    };

    const saveCategories = async (newCategories: Category[]) => {
        try {
            setCategories(newCategories); // Optimistic UI update
            await updateSettings({ categories: newCategories });
        } catch (error) {
            console.error('Failed to save settings', error);
            // Rollback on failure could be implemented here
        }
    };

    return (
        <SettingsContext.Provider value={{ categories, saveCategories, loading }}>
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
