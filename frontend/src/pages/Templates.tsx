import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchTransactions, updateTransaction, deleteTransaction, type Transaction } from '../services/api';
import { TransactionModal } from '../components/TransactionModal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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

interface TemplatesProps {
  hideHeader?: boolean;
}

const Templates: React.FC<TemplatesProps> = ({ hideHeader }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Transaction | null>(null);

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

  const handleOpenModalForEdit = (tx: Transaction) => {
    setEditingTemplate(tx);
    setModalOpen(true);
  };

  const handleSaveTemplate = async (data: any) => {
    try {
      if (editingTemplate && editingTemplate.transactionId) {
        await updateTransaction(editingTemplate.transactionId, data);
        await loadTransactions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await deleteTransaction(id);
      await loadTransactions();
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const activeTemplates = transactions.filter(t => (t.isTemplate || t.transactionId?.startsWith('TEMPLATE_')) && t.isActive !== false);

  return (
    <Container style={{ padding: hideHeader ? 0 : undefined }}>
      {!hideHeader && (
        <Header>
          <Title>{t('templates.manageTemplates')}</Title>
          <HeaderActions>
            <Button onClick={() => navigate('/dashboard')}>{t('templates.backToDashboard')}</Button>
          </HeaderActions>
        </Header>
      )}

      {/* Conditionally hide the secondary title if embedded */}
      {!hideHeader && <Title style={{ fontSize: '24px', marginBottom: '16px' }}>{t('templates.yourTemplates')}</Title>}

      <TransactionList>
        {activeTemplates.length === 0 && (
          <div style={{ color: '#a3a3a3', textAlign: 'center', padding: '2rem' }}>{t('templates.noTemplates')}</div>
        )}
        {activeTemplates.map((template, idx) => (
          <TransactionItem key={template.transactionId || idx} onClick={() => handleOpenModalForEdit(template)}>
            <TxLeft>
              <TxTitle>{template.category}</TxTitle>
              <TxSubtitle>Interval: {template.recurrenceInterval === 1 ? t('templates.intervalMonthly') : t('templates.intervalMonths', { count: template.recurrenceInterval })} - {template.description}</TxSubtitle>
            </TxLeft>
            <TxAmount $type={template.type}>
              {template.type === 'income' ? '+' : '-'}{formatCurrency(template.amount)}
            </TxAmount>
          </TransactionItem>
        ))}
      </TransactionList>

      <TransactionModal
        isOpen={isModalOpen}
        initialData={editingTemplate}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveTemplate}
        onDelete={handleDeleteTemplate}
      />
    </Container>
  );
};

export default Templates;
