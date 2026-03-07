import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useSettings } from '../contexts/SettingsContext';
import { fetchTransactions, createTransaction, type Transaction } from '../services/api';
import { IconRenderer } from '../components/IconRenderer';
import { DateSelector } from '../components/DateSelector';
import { useDateStore } from '../store/dateStore';
import { useTranslation } from 'react-i18next';
import { TransactionModal } from '../components/TransactionModal';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  padding-bottom: calc(${({ theme }) => theme.spacing.xl} + 84px);
  
  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
    padding-bottom: ${({ theme }) => theme.spacing.xl};
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: ${({ theme }) => theme.spacing.lg};
  }
`;

const SummaryCard = styled.div<{ $featured?: boolean }>`
  ${({ theme }) => theme.utils.glass}
  background: rgba(255, 255, 255, 0.03);
  padding: ${({ theme, $featured }) => $featured ? theme.spacing.lg : theme.spacing.md};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme, $featured }) => $featured ? theme.spacing.sm : theme.spacing.xs};
  grid-column: ${({ $featured }) => $featured ? '1 / -1' : 'auto'};

  @media (min-width: 768px) {
    grid-column: auto;
    padding: ${({ theme }) => theme.spacing.lg};
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const CardLabel = styled.span<{ $featured?: boolean }>`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ $featured }) => $featured ? '14px' : '12px'};

  @media (min-width: 768px) {
    font-size: 14px;
  }
`;

const CardValue = styled.span<{ $type?: 'income' | 'expense' | 'projected'; $featured?: boolean }>`
  font-size: ${({ $featured }) => $featured ? '32px' : '20px'};
  font-weight: 600;
  color: ${({ theme, $type }) =>
    $type === 'income' ? theme.colors.success :
      $type === 'expense' ? theme.colors.danger :
        $type === 'projected' ? '#3b82f6' :
          theme.colors.textPrimary};

  @media (min-width: 768px) {
    font-size: 32px;
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

const SuggestedSubtitle = styled(TxSubtitle)`
  @media (max-width: 767px) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
`;

const TxAmount = styled.div<{ $type: 'income' | 'expense' }>`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme, $type }) => $type === 'income' ? theme.colors.success : theme.colors.textPrimary};
`;

const SuggestedTitle = styled(Title)`
  font-size: 20px;
  margin: 24px 0 12px;

  @media (min-width: 768px) {
    font-size: 24px;
    margin: 32px 0 16px;
  }
`;

const SuggestedItem = styled(TransactionItem)`
  border-left: 4px solid #3b82f6;
  background: rgba(59, 130, 246, 0.05);
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
    gap: ${({ theme }) => theme.spacing.xs};
  }
`;

const SuggestedItemLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  min-width: 0;

  @media (max-width: 767px) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const SuggestedIconWrap = styled.div`
  padding: 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  display: flex;

  @media (max-width: 767px) {
    padding: 8px;
    border-radius: 10px;
  }
`;

const SuggestedItemRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};

  @media (max-width: 767px) {
    justify-content: space-between;
    width: 100%;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const SuggestedAcceptButton = styled(Button)`
  @media (max-width: 767px) {
    padding: 6px 12px;
    font-size: 13px;
    min-height: 34px;
    min-width: 116px;
    text-align: center;
  }
`;

const SuggestedAmount = styled(TxAmount)`
  @media (max-width: 767px) {
    font-size: 14px;
  }
`;

const FloatingAddButton = styled(Button)`
  position: fixed;
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  bottom: calc(${({ theme }) => theme.spacing.md} + env(safe-area-inset-bottom));
  z-index: 900;
  width: auto;
  min-height: 48px;
  border-radius: 12px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const FooterActions = styled.div`
  margin-top: 32px;
  text-align: center;

  @media (max-width: 767px) {
    display: none;
  }
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { categories } = useSettings();
  const { selectedMonth, selectedYear } = useDateStore();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [acceptingTemplates, setAcceptingTemplates] = useState<Set<string>>(new Set());
  const [isModalOpen, setModalOpen] = useState(false);

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
    return txDate.getMonth() === selectedMonth && txDate.getFullYear() === selectedYear;
  });

  // Suggestion Engine based ONLY on current month since overview is locked to "Today/This Month"
  const suggestedTemplates = activeTemplates.filter(template => {
    if (!template.date) return false;
    const tDate = new Date(template.date);
    const monthsDifference = (selectedYear - tDate.getFullYear()) * 12 + (selectedMonth - tDate.getMonth());

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
        description: template.description || t('templates.recurringMonthly'),
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

  const handleOpenModalForCreate = () => {
    setModalOpen(true);
  };

  const handleSaveTransaction = async (data: Transaction) => {
    try {
      await createTransaction(data);
      await loadTransactions();
    } catch (err) {
      console.error(err);
    }
  };

  const income = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  const suggestedExpense = suggestedTemplates.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const projectedExpenses = expense + suggestedExpense;

  return (
    <Container>
      <Header />

      <DateSelector />

      <CardsGrid>
        <SummaryCard $featured>
          <CardLabel $featured>{t('dashboard.currentBalance')}</CardLabel>
          <CardValue $featured>{formatCurrency(balance)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>{t('dashboard.totalIncome')}</CardLabel>
          <CardValue $type="income">+{formatCurrency(income)}</CardValue>
        </SummaryCard>
        <SummaryCard>
          <CardLabel>{t('dashboard.totalExpenses')}</CardLabel>
          <CardValue $type="expense">-{formatCurrency(expense)}</CardValue>
        </SummaryCard>
        {suggestedTemplates.filter(t => t.type === 'expense').length > 0 && (
          <SummaryCard>
            <CardLabel>{t('dashboard.projectedExpenses')}</CardLabel>
            <CardValue $type="projected">-{formatCurrency(projectedExpenses)}</CardValue>
          </SummaryCard>
        )}
      </CardsGrid>

      {suggestedTemplates.length > 0 && (
        <>
          <SuggestedTitle>{t('dashboard.suggestedActions')}</SuggestedTitle>
          <TransactionList>
            {suggestedTemplates.map((template, idx) => {
              const catDef = categories.find(c => c.name === template.category);
              return (
                <SuggestedItem key={template.transactionId || idx}>
                  <SuggestedItemLeft>
                    <SuggestedIconWrap>
                      <IconRenderer name={catDef?.icon || 'FiHelpCircle'} color="#3b82f6" />
                    </SuggestedIconWrap>
                    <TxLeft>
                      <TxTitle>{template.description || template.category}</TxTitle>
                      <SuggestedSubtitle>
                        {template.description ? template.category : ''} {template.description ? '• ' : ''}
                        {template.recurrenceInterval === 1 ? t('templates.intervalMonthly') : t('templates.intervalMonths', { count: template.recurrenceInterval })}
                      </SuggestedSubtitle>
                    </TxLeft>
                  </SuggestedItemLeft>
                  <SuggestedItemRight>
                    <SuggestedAmount $type={template.type}>
                      {template.type === 'income' ? '+' : '-'}{formatCurrency(template.amount)}
                    </SuggestedAmount>
                    <SuggestedAcceptButton
                      $primary
                      disabled={acceptingTemplates.has(template.transactionId!)}
                      style={{ opacity: acceptingTemplates.has(template.transactionId!) ? 0.5 : 1, cursor: acceptingTemplates.has(template.transactionId!) ? 'not-allowed' : 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); handleAcceptSuggestion(template); }}
                    >
                      {acceptingTemplates.has(template.transactionId!) ? t('common.accepting') : t('common.accept')}
                    </SuggestedAcceptButton>
                  </SuggestedItemRight>
                </SuggestedItem>
              );
            })}
          </TransactionList>
        </>
      )}

      <FooterActions>
        <Button $primary onClick={() => navigate('/transactions')}>{t('dashboard.viewAllTransactions')}</Button>
      </FooterActions>

      <FloatingAddButton $primary onClick={handleOpenModalForCreate}>
        {t('transactions.addTransaction')}
      </FloatingAddButton>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTransaction}
        presentation="bottom-sheet"
      />

    </Container>
  );
};

export default Dashboard;
