import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSettings } from '../contexts/SettingsContext';
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction, type Transaction } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { IconRenderer } from '../components/IconRenderer';
import { DateSelector } from '../components/DateSelector';
import { useDateStore } from '../store/dateStore';
import { useTranslation } from 'react-i18next';
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
  Type as ListType,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';
import { FiTrash2 } from 'react-icons/fi';

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

const AddButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const AddTransactionButton = styled(Button)`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border-radius: 12px;
  
  @media (min-width: 768px) {
    width: auto;
    padding: 12px 32px;
  }
`;

const TransactionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const TransactionItem = styled.div<{ $isLast?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: ${({ $isLast }) => ($isLast ? 'none' : '1px solid rgba(255, 255, 255, 0.05)')};
  transition: background 0.2s;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
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
  color: ${({ theme, $type }) => $type === 'income' ? theme.colors.success : theme.colors.textPrimary};
`;

const SwipeActionContent = styled.div`
  background-color: ${({ theme }) => theme.colors.danger};
  color: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
  height: 100%;
  border-radius: 12px;
  width: 100%;
  font-weight: 500;
  gap: 8px;
`;

const TxLeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const TxIconContainer = styled.div<{ $type: 'income' | 'expense' }>`
  padding: 10px;
  background: ${({ $type }) => $type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'};
  border-radius: 12px;
  display: flex;
`;

const DayGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const DayDateLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-transform: capitalize;
`;

const DayTotalLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DayCard = styled.div`
  ${({ theme }) => theme.utils.glass}
  background: rgba(255, 255, 255, 0.03);
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: 16px;

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.lg};
  }
`;

const NoTransactionsMessage = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  padding: 2rem;
`;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};


const Transactions: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { categories } = useSettings();
  const { selectedMonth, selectedYear } = useDateStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
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

  const sortedTransactions = [...filteredTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedTransactions = sortedTransactions.reduce((acc, tx) => {
    const day = new Date(tx.date).getDate().toString().padStart(2, '0');
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const sortedDays = Object.keys(groupedTransactions).sort((a, b) => parseInt(b) - parseInt(a));

  const trailingActions = (tx: Transaction) => (
    <TrailingActions>
      <SwipeAction
        destructive={true}
        onClick={() => handleDeleteTransaction(tx.transactionId!)}
      >
        <SwipeActionContent>
          <FiTrash2 size={20} />
          {t('common.delete')}
        </SwipeActionContent>
      </SwipeAction>
    </TrailingActions>
  );

  return (
    <Container>
      <DateSelector />

      <AddButtonContainer>
        <AddTransactionButton $primary onClick={handleOpenModalForCreate}>
          {t('transactions.addTransaction')}
        </AddTransactionButton>
      </AddButtonContainer>

      <TransactionList>
        {sortedDays.length === 0 && (
          <NoTransactionsMessage>{t('transactions.noTransactions')}</NoTransactionsMessage>
        )}
        {sortedDays.map(day => {
          const dayTransactions = groupedTransactions[day];
          const firstTxDate = new Date(dayTransactions[0].date);

          let formattedDate = new Intl.DateTimeFormat(i18n.language, {
            weekday: 'long',
            day: 'numeric',
            month: 'short'
          }).format(firstTxDate);

          // Capitalize first letter
          formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

          const dayTotalExpenses = dayTransactions
            .filter(tx => tx.type === 'expense')
            .reduce((sum, tx) => sum + tx.amount, 0);

          return (
            <DayCard key={day}>
              <DayGroupHeader>
                <DayDateLabel>{formattedDate}</DayDateLabel>
                {dayTotalExpenses > 0 && (
                  <DayTotalLabel>
                    -{formatCurrency(dayTotalExpenses)}
                  </DayTotalLabel>
                )}
              </DayGroupHeader>
              <SwipeableList type={ListType.IOS} fullSwipe={true}>
                {dayTransactions.map((tx, idx) => {
                  const catDef = categories.find(c => c.name === tx.category);
                  const isLast = idx === dayTransactions.length - 1;
                  return (
                    <SwipeableListItem
                      key={tx.transactionId || idx}
                      trailingActions={trailingActions(tx)}
                    >
                      <TransactionItem
                        style={{ width: '100%' }}
                        $isLast={isLast}
                        onClick={() => handleOpenModalForEdit(tx)}
                      >
                        <TxLeftContent>
                          <TxIconContainer $type={tx.type}>
                            <IconRenderer name={catDef?.icon || 'FiHelpCircle'} color={tx.type === 'income' ? '#10b981' : '#f43f5e'} />
                          </TxIconContainer>
                          <TxLeft>
                            <TxTitle>{tx.description || tx.category}</TxTitle>
                            <TxSubtitle>{tx.description ? tx.category : ''}</TxSubtitle>
                          </TxLeft>
                        </TxLeftContent>
                        <TxAmount $type={tx.type}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </TxAmount>
                      </TransactionItem>
                    </SwipeableListItem>
                  );
                })}
              </SwipeableList>
            </DayCard>
          );
        })}
      </TransactionList>

      <TransactionModal
        isOpen={isModalOpen}
        initialData={editingTransaction}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        presentation="bottom-sheet"
      />
    </Container>
  );
};

export default Transactions;
