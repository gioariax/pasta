import { getCurrentUserToken } from './cognito';

const API_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3001';

export interface Transaction {
    transactionId?: string;
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
    isRecurring?: boolean;
    recurrenceInterval?: number; // 1, 2, or 3 months
    recurrenceId?: string;
    isTemplate?: boolean;
    isActive?: boolean;
}

const getHeaders = async () => {
    const token = await getCurrentUserToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    if (API_URL === 'http://localhost:3001') {
        // Mock data for development if no backend URL
        return [
            { transactionId: '1', type: 'income', amount: 5000, category: 'Salary', description: 'Monthly Salary', date: new Date().toISOString() },
            { transactionId: '2', type: 'expense', amount: 1200, category: 'Housing', description: 'Rent', date: new Date().toISOString() },
        ];
    }

    const response = await fetch(`${API_URL}/transactions`, {
        headers: await getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch transactions');
    const data = await response.json();
    return data.transactions || [];
};

export const createTransaction = async (transaction: Transaction): Promise<Transaction> => {
    if (API_URL === 'http://localhost:3001') {
        return { ...transaction, transactionId: Date.now().toString() };
    }

    const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
};

export const updateTransaction = async (id: string, transaction: Transaction): Promise<Transaction> => {
    if (API_URL === 'http://localhost:3001') {
        return { ...transaction, transactionId: id };
    }

    const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(transaction),
    });

    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
};

export const deleteTransaction = async (id: string): Promise<void> => {
    if (API_URL === 'http://localhost:3001') {
        return;
    }

    const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: await getHeaders(),
    });

    if (!response.ok) throw new Error('Failed to delete transaction');
};
