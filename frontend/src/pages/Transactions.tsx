import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiList } from 'react-icons/fi';
import { useSettings } from '../contexts/SettingsContext';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction, type Transaction } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { IconRenderer } from '../components/IconRenderer';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from '../components/ui/select';
import { createListCollection } from '@chakra-ui/react';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ theme, $primary }) => $primary ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ theme, $primary }) => $primary ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TxLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TxTitle = styled.div`
  font-weight: 500;
  font-size: 16px;
`;

const TxSubtitle = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TxAmount = styled.div<{ $type: 'income' | 'expense' }>`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme, $type }) => $type === 'income' ? theme.colors.success : theme.colors.danger};
`;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const monthCollection = createListCollection({
    items: MONTHS.map((m, idx) => ({ label: m, value: String(idx) }))
});

const Transactions: React.FC = () => {
    const { categories } = useSettings();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isModalOpen, setModalOpen] = useState(false);

    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const data = await fetchTransactions();
            setTransactions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

    const handleOpenModalForCreate = () => {
        setEditingTransaction(null);
        setModalOpen(true);
    };

    const handleOpenModalForEdit = (tx: Transaction) => {
        setEditingTransaction(tx);
        setModalOpen(true);
    };

    const handleSaveTransaction = async (data: any) => {
        try {
            if (editingTransaction && editingTransaction.transactionId) {
                await updateTransaction(editingTransaction.transactionId, data);
            } else {
                await createTransaction(data);
            }
            await loadTransactions();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTransaction = async (id: string) => {
        try {
            await deleteTransaction(id);
            await loadTransactions();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
        }
    };

    const normalTransactions = transactions.filter(t => !t.isTemplate && !t.transactionId?.startsWith('TEMPLATE_'));

    const filteredTransactions = normalTransactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
    });

    const currentYearNum = currentDate.getFullYear();
    const availableYears = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

    const yearCollection = createListCollection({
        items: availableYears.map(y => ({ label: String(y), value: String(y) }))
    });

    return (
        <Container>
            <Header>
                <Title><FiList /> Transactions</Title>
                <Button $primary onClick={handleOpenModalForCreate}>+ Add Transaction</Button>
            </Header>

            <FilterContainer>
                <SelectRoot
                    size="sm"
                    width="120px"
                    collection={yearCollection}
                    value={[String(selectedYear)]}
                    onValueChange={(e) => setSelectedYear(Number(e.value[0]))}
                    variant="subtle"
                >
                    <SelectTrigger>
                        <SelectValueText placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                        {yearCollection.items.map((item) => (
                            <SelectItem item={item} key={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectRoot>

                <SelectRoot
                    size="sm"
                    width="160px"
                    collection={monthCollection}
                    value={[String(selectedMonth)]}
                    onValueChange={(e) => setSelectedMonth(Number(e.value[0]))}
                    variant="subtle"
                >
                    <SelectTrigger>
                        <SelectValueText placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                        {monthCollection.items.map((item) => (
                            <SelectItem item={item} key={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectRoot>
            </FilterContainer>

            <TransactionList>
                {filteredTransactions.length === 0 && (
                    <div style={{ color: '#a3a3a3', textAlign: 'center', padding: '2rem' }}>No transactions found for this period</div>
                )}
                {filteredTransactions.map((tx, idx) => {
                    const catDef = categories.find(c => c.name === tx.category);
                    return (
                        <TransactionItem key={tx.transactionId || idx} onClick={() => handleOpenModalForEdit(tx)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex' }}>
                                    <IconRenderer name={catDef?.icon || 'FiHelpCircle'} color={tx.type === 'income' ? '#10b981' : '#f43f5e'} />
                                </div>
                                <TxLeft>
                                    <TxTitle>{tx.category}</TxTitle>
                                    <TxSubtitle>{tx.description || new Date(tx.date).toLocaleDateString()}</TxSubtitle>
                                </TxLeft>
                            </div>
                            <TxAmount $type={tx.type}>
                                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </TxAmount>
                        </TransactionItem>
                    );
                })}
            </TransactionList>

            <TransactionModal
                isOpen={isModalOpen}
                initialData={editingTransaction}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSaveTransaction}
                onDelete={handleDeleteTransaction}
            />
        </Container>
    );
};

export default Transactions;
