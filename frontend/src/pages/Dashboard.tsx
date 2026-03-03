import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction, type Transaction } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';

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

const Select = styled.select`
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  outline: none;
  cursor: pointer;

  &:focus {
    background: rgba(255, 255, 255, 0.1);
  }
  
  option {
    background: #171717; /* Matches theme surface mostly */
  }
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
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
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

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SummaryCard = styled.div`
  ${({ theme }) => theme.utils.glass}
  background: rgba(255, 255, 255, 0.03);
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CardLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

const CardValue = styled.span<{ $type?: 'income' | 'expense' }>`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success :
      $type === 'expense' ? theme.colors.danger :
        theme.colors.textPrimary};
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

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
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
        // Update
        const updated = await updateTransaction(editingTransaction.transactionId, data);
        setTransactions(transactions.map(t =>
          t.transactionId === editingTransaction.transactionId ? updated : t
        ));
      } else {
        // Create
        const saved = await createTransaction(data);
        setTransactions([saved, ...transactions]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      setTransactions(transactions.filter(t => t.transactionId !== id));
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
  });

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  const currentYearNum = currentDate.getFullYear();
  const availableYears = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

  return (
    <Container>
      <Header>
        <Title>Overview</Title>
        <HeaderActions>
          <Button $primary onClick={handleOpenModalForCreate}>+ Add Transaction</Button>
          <Button onClick={logout}>Sign Out</Button>
        </HeaderActions>
      </Header>

      <FilterContainer>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </Select>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {MONTHS.map((month, idx) => (
            <option key={month} value={idx}>{month}</option>
          ))}
        </Select>
      </FilterContainer>

      <CardsGrid>
        <SummaryCard>
          <CardLabel>Current Balance</CardLabel>
          <CardValue>{formatCurrency(balance)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>Total Income</CardLabel>
          <CardValue $type="income">+{formatCurrency(income)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>Total Expenses</CardLabel>
          <CardValue $type="expense">-{formatCurrency(expense)}</CardValue>
        </SummaryCard>
      </CardsGrid>

      <Title style={{ fontSize: '24px', marginBottom: '16px' }}>Recent Transactions</Title>
      <TransactionList>
        {filteredTransactions.length === 0 && (
          <div style={{ color: '#a3a3a3', textAlign: 'center', padding: '2rem' }}>No transactions found for this period</div>
        )}
        {filteredTransactions.map((tx, idx) => (
          <TransactionItem key={tx.transactionId || idx} onClick={() => handleOpenModalForEdit(tx)}>
            <TxLeft>
              <TxTitle>{tx.category}</TxTitle>
              <TxSubtitle>{tx.description || new Date(tx.date).toLocaleDateString()}</TxSubtitle>
            </TxLeft>
            <TxAmount $type={tx.type}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
            </TxAmount>
          </TransactionItem>
        ))}
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

export default Dashboard;
