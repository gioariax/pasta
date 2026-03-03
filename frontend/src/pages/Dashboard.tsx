import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import pastaLogo from '../assets/pastalogo.svg';
import { useAuth } from '../contexts/AuthContext';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction, type Transaction } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { NativeSelectRoot, NativeSelectField } from '../components/ui/native-select';

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
  const [acceptingTemplates, setAcceptingTemplates] = useState<Set<string>>(new Set());

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
        await updateTransaction(editingTransaction.transactionId, data);
      } else {
        // Create
        await createTransaction(data);
      }
      await loadTransactions(); // Refresh everything to get implicitly created templates
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
  const activeTemplates = transactions.filter(t => (t.isTemplate || t.transactionId?.startsWith('TEMPLATE_')) && t.isActive !== false);

  const filteredTransactions = normalTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
  });

  // Suggestion Engine
  const suggestedTemplates = activeTemplates.filter(template => {
    if (!template.date) return false;
    const tDate = new Date(template.date);
    const monthsDifference = (selectedYear - tDate.getFullYear()) * 12 + (selectedMonth - tDate.getMonth());

    // Check if interval matches and it's not in the future
    const interval = template.recurrenceInterval || 1;
    if (monthsDifference >= 0 && monthsDifference % interval === 0) {
      // Check if already paid this month
      const alreadyPaid = filteredTransactions.some(tx => tx.recurrenceId === template.transactionId);
      return !alreadyPaid;
    }
    return false;
  });

  const handleAcceptSuggestion = async (template: Transaction) => {
    if (!template.transactionId || acceptingTemplates.has(template.transactionId)) return;

    setAcceptingTemplates(prev => {
      const newSet = new Set(prev);
      newSet.add(template.transactionId!);
      return newSet;
    });

    try {
      const newTx = {
        amount: template.amount,
        category: template.category,
        description: template.description || 'Recurring Transaction',
        type: template.type,
        date: new Date(selectedYear, selectedMonth, new Date().getDate()).toISOString(),
        recurrenceId: template.transactionId,
      };
      await createTransaction(newTx);
      await loadTransactions();
    } catch (err) {
      console.error(err);
    } finally {
      setAcceptingTemplates(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.transactionId!);
        return newSet;
      });
    }
  };

  const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  const suggestedExpense = suggestedTemplates.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const projectedExpenses = expense + suggestedExpense;

  const currentYearNum = currentDate.getFullYear();
  const availableYears = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

  return (
    <Container>
      <Header>
        <Title>
          <img src={pastaLogo} alt="Pasta Logo" style={{ height: '32px' }} />
          Overview
        </Title>
        <HeaderActions>
          <Button onClick={() => window.location.href = '/templates'}>Manage Templates</Button>
          <Button $primary onClick={handleOpenModalForCreate}>+ Add Transaction</Button>
          <Button onClick={logout}>Sign Out</Button>
        </HeaderActions>
      </Header>

      <FilterContainer>
        <NativeSelectRoot size="sm" width="120px">
          <NativeSelectField value={selectedYear} onChange={(e: any) => setSelectedYear(Number(e.currentTarget.value))}>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>
        <NativeSelectRoot size="sm" width="160px">
          <NativeSelectField value={selectedMonth} onChange={(e: any) => setSelectedMonth(Number(e.currentTarget.value))}>
            {MONTHS.map((month, idx) => (
              <option key={month} value={idx}>{month}</option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>
      </FilterContainer>

      <CardsGrid>
        <SummaryCard>
          <CardLabel>Current Balance</CardLabel>
          <CardValue>{formatCurrency(balance)}</CardValue>
        </SummaryCard>
        <SummaryCard style={suggestedTemplates.filter(t => t.type === 'expense').length > 0 ? { border: '1px solid rgba(59, 130, 246, 0.3)' } : {}}>
          <CardLabel>Projected Expenses</CardLabel>
          <CardValue $type="expense">-{formatCurrency(projectedExpenses)}</CardValue>
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

      {suggestedTemplates.length > 0 && (
        <>
          <Title style={{ fontSize: '24px', margin: '32px 0 16px' }}>Suggested Actions</Title>
          <TransactionList>
            {suggestedTemplates.map((template, idx) => (
              <TransactionItem key={template.transactionId || idx} style={{ borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                <TxLeft>
                  <TxTitle>{template.category}</TxTitle>
                  <TxSubtitle>Recurring {template.recurrenceInterval === 1 ? 'Monthly' : `Every ${template.recurrenceInterval} Months`} - {template.description}</TxSubtitle>
                </TxLeft>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <TxAmount $type={template.type}>
                    {template.type === 'income' ? '+' : '-'}{formatCurrency(template.amount)}
                  </TxAmount>
                  <Button
                    $primary
                    disabled={acceptingTemplates.has(template.transactionId!)}
                    style={{ opacity: acceptingTemplates.has(template.transactionId!) ? 0.5 : 1, cursor: acceptingTemplates.has(template.transactionId!) ? 'not-allowed' : 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); handleAcceptSuggestion(template); }}
                  >
                    {acceptingTemplates.has(template.transactionId!) ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              </TransactionItem>
            ))}
          </TransactionList>
        </>
      )}

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
