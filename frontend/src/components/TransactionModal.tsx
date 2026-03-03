import React, { useState } from 'react';
import styled from 'styled-components';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: any) => void;
  onDelete?: (id: string) => void;
  initialData?: any;
}

const CATEGORIES = {
  expense: ['Housing', 'Food & Groceries', 'Utilities', 'Transportation', 'Entertainment', 'Health', 'Shopping', 'Other'],
  income: ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other']
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  ${({ theme }) => theme.utils.glass}
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

const Row = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  
  &:hover {
    background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const DeleteButton = styled(Button)`
  margin-right: auto;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.danger};
  border: 1px solid ${({ theme }) => theme.colors.danger};

  &:hover {
    background-color: ${({ theme }) => theme.colors.danger};
    color: white;
  }
`;

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialData, onSubmit, onDelete }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  // Pre-populate fields on open
  React.useEffect(() => {
    if (isOpen && initialData) {
      setType(initialData.type);
      setAmount(initialData.amount.toString());
      // Need a tiny timeout so category updates after type change if necessary
      setTimeout(() => setCategory(initialData.category), 0);
      setDescription(initialData.description || '');
      setDate(new Date(initialData.date).toISOString().split('T')[0]);
      setIsRecurring(!!initialData.isRecurring || !!initialData.isTemplate);
      setRecurrenceInterval(initialData.recurrenceInterval || 1);
    } else if (isOpen && !initialData) {
      setType('expense');
      setAmount('');
      setCategory(CATEGORIES.expense[0]);
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setRecurrenceInterval(1);
    }
  }, [isOpen, initialData]);

  // Update category automatically if type changes
  React.useEffect(() => {
    if (!initialData || type !== initialData.type) {
      setCategory(CATEGORIES[type][0]);
    }
  }, [type, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...initialData, // Include existing data if editing
      type,
      amount: parseFloat(amount),
      category,
      description,
      date: new Date(date).toISOString(), // Use custom UI date instead
      isRecurring,
      recurrenceInterval: isRecurring ? recurrenceInterval : undefined
    });
    setAmount('');
    setCategory(CATEGORIES[type][0]);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurrenceInterval(1);
    onClose();
  };

  return (
    <Overlay>
      <ModalContent>
        <Title>{initialData ? 'Edit Transaction' : 'Add Transaction'}</Title>
        <Form onSubmit={handleSubmit}>
          <Select value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </Select>
          <Input
            type="number"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Select value={category} onChange={e => setCategory(e.target.value)} required>
            {CATEGORIES[type].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
          <Input
            type="text"
            placeholder="Description..."
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            title="Transaction Date"
          />

          {!initialData?.isTemplate && (
            <CheckboxContainer>
              <CheckboxInput
                type="checkbox"
                id="recurring-check"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <CheckboxLabel htmlFor="recurring-check">
                Make this a recurring transaction
              </CheckboxLabel>
            </CheckboxContainer>
          )}

          {(isRecurring || initialData?.isTemplate) && (
            <Select value={recurrenceInterval} onChange={e => setRecurrenceInterval(Number(e.target.value))}>
              <option value={1}>Monthly</option>
              <option value={2}>Every 2 Months</option>
              <option value={3}>Every 3 Months</option>
            </Select>
          )}
          <Row>
            {initialData && initialData.transactionId && onDelete && (
              <DeleteButton type="button" onClick={() => {
                onDelete(initialData.transactionId);
                onClose();
              }}>
                Delete
              </DeleteButton>
            )}
            <Button type="button" $variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" $variant="primary">Save</Button>
          </Row>
        </Form>
      </ModalContent>
    </Overlay>
  );
};
