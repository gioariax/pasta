import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiHome } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { fetchTransactions, createTransaction, type Transaction } from '../services/api';
import { IconRenderer } from '../components/IconRenderer';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  
  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
  
  max-width: 1200px;
  margin: 0 auto;
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

const CardValue = styled.span<{ $type?: 'income' | 'expense' | 'projected' }>`
  font-size: 32px;
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success :
      $type === 'expense' ? theme.colors.danger :
        $type === 'projected' ? '#3b82f6' :
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

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const { categories } = useSettings();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [acceptingTemplates, setAcceptingTemplates] = useState<Set<string>>(new Set());

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

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

  const normalTransactions = transactions.filter(t => !t.isTemplate && !t.transactionId?.startsWith('TEMPLATE_'));
  const activeTemplates = transactions.filter(t => (t.isTemplate || t.transactionId?.startsWith('TEMPLATE_')) && t.isActive !== false);

  const currentMonthTransactions = normalTransactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
  });

  // Suggestion Engine based ONLY on current month since overview is locked to "Today/This Month"
  const suggestedTemplates = activeTemplates.filter(template => {
    if (!template.date) return false;
    const tDate = new Date(template.date);
    const monthsDifference = (currentYear - tDate.getFullYear()) * 12 + (currentMonth - tDate.getMonth());

    const interval = template.recurrenceInterval || 1;
    if (monthsDifference >= 0 && monthsDifference % interval === 0) {
      const alreadyPaid = currentMonthTransactions.some(tx => tx.recurrenceId === template.transactionId);
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
        date: new Date(currentYear, currentMonth, new Date().getDate()).toISOString(),
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

  const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  const suggestedExpense = suggestedTemplates.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const projectedExpenses = expense + suggestedExpense;

  return (
    <Container>
      <Header>
        <Title><FiHome /> Overview</Title>
        <HeaderActions>
          <Button onClick={logout}>Sign Out</Button>
        </HeaderActions>
      </Header>

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
        {suggestedTemplates.filter(t => t.type === 'expense').length > 0 && (
          <SummaryCard>
            <CardLabel>Projected Expenses</CardLabel>
            <CardValue $type="projected">-{formatCurrency(projectedExpenses)}</CardValue>
          </SummaryCard>
        )}
      </CardsGrid>

      {suggestedTemplates.length > 0 && (
        <>
          <Title style={{ fontSize: '24px', margin: '32px 0 16px' }}>Suggested Actions for This Month</Title>
          <TransactionList>
            {suggestedTemplates.map((template, idx) => {
              const catDef = categories.find(c => c.name === template.category);
              return (
                <TransactionItem key={template.transactionId || idx} style={{ borderLeft: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', display: 'flex' }}>
                      <IconRenderer name={catDef?.icon || 'FiHelpCircle'} color="#3b82f6" />
                    </div>
                    <TxLeft>
                      <TxTitle>{template.category}</TxTitle>
                      <TxSubtitle>Recurring {template.recurrenceInterval === 1 ? 'Monthly' : `Every ${template.recurrenceInterval} Months`} - {template.description}</TxSubtitle>
                    </TxLeft>
                  </div>
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
              );
            })}
          </TransactionList>
        </>
      )}

      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Button $primary onClick={() => navigate('/transactions')}>View All Transactions</Button>
      </div>

    </Container>
  );
};

export default Dashboard;
