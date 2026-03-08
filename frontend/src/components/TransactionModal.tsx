import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Input, parseDate, createListCollection } from '@chakra-ui/react';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from './ui/select';
import { SegmentedControl } from './ui/segmented-control';
import { Switch } from './ui/switch';
import { DatePickerRoot, DatePickerControl, DatePickerInput } from './ui/date-picker';
import { formatDateAsDdSlashMMSlashYyyy, parseDdSlashMMSlashYyyyToDateValue } from '../lib/date';
import type { Transaction } from '../services/api';
import { useTranslation } from 'react-i18next';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Transaction) => void | Promise<void>;
  onDelete?: (id: string) => void;
  initialData?: Transaction | null;
  presentation?: 'center' | 'bottom-sheet';
}

import { useSettings } from '../contexts/SettingsContext';

const recurrenceCollection = createListCollection({
  items: [
    { label: 'Monthly', value: '1' },
    { label: 'Every 2 Months', value: '2' },
    { label: 'Every 3 Months', value: '3' }
  ]
});

const Overlay = styled.div<{ $presentation: 'center' | 'bottom-sheet' }>`
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

  @media (max-width: 767px) {
    align-items: ${({ $presentation }) => $presentation === 'bottom-sheet' ? 'initial' : 'center'};
    padding: ${({ theme, $presentation }) => $presentation === 'bottom-sheet' ? '0' : theme.spacing.md};
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
`;

const ModalContent = styled.div<{ $presentation: 'center' | 'bottom-sheet' }>`
  ${({ theme }) => theme.utils.glass}
  background: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 767px) {
    ${({ $presentation, theme }) => $presentation === 'bottom-sheet' ? css`
      position: fixed;
      top: 10vh;
      left: 0;
      width: 100vw;
      height: 90vh;
      max-width: 100vw;
      margin: 0;
      border-radius: 16px 16px 0 0;
      padding: ${theme.spacing.lg};
      overflow-y: auto;
      overscroll-behavior: contain;
      animation: ${slideUp} 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    ` : css`
      animation: ${slideUp} 0.2s ease-out forwards;
    `}
  }
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

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, initialData, onSubmit, onDelete, presentation = 'center' }) => {
  const { categories: allCategories } = useSettings();
  const { t } = useTranslation();
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const currentCategories = allCategories.filter(c => c.type === type).map(c => c.name);
  const defaultCategory = currentCategories.length > 0 ? currentCategories[0] : '';

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  const amountInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

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
      const expenses = allCategories.filter(c => c.type === 'expense').map(c => c.name);
      setCategory(expenses.length > 0 ? expenses[0] : '');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
      setRecurrenceInterval(1);
    }
  }, [allCategories, isOpen, initialData]);

  // Update category automatically if type changes
  useEffect(() => {
    if (!initialData || type !== initialData.type) {
      if (currentCategories.length > 0 && !currentCategories.includes(category)) {
        setCategory(currentCategories[0]);
      }
    }
  }, [type, initialData, currentCategories, category]);

  // Handle auto-focus when modal opens
  useEffect(() => {
    if (isOpen) {
      // AutoFocus naturally brings up the keyboard, but browsers may over-scroll the view inside the modal.
      // We reset the scroll to the top of the modal content after the animation to ensure the Value/Category fields are visible.
      const timer = setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
    setCategory(defaultCategory);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsRecurring(false);
    setRecurrenceInterval(1);
    onClose();
  };

  return (
    <Overlay $presentation={presentation}>
      <ModalContent ref={modalContentRef} $presentation={presentation}>
        <Title>{initialData ? t('transactions.editTransaction') : t('transactions.newTransaction')}</Title>
        <Form onSubmit={handleSubmit}>
          <SegmentedControl
            name="type"
            value={type}
            onValueChange={(e) => setType(e.value as 'income' | 'expense')}
            items={[
              { label: t('common.expense'), value: 'expense' },
              { label: t('common.income'), value: 'income' }
            ]}
            css={{
              "--segment-indicator-bg": "#6366f1",
              "--segment-item-color": "white",
            }}
          />
          <Input
            ref={amountInputRef}
            autoFocus
            value={amount}
            onChange={(e) => {
              const val = e.target.value.replace(',', '.');
              if (/^\d*\.?\d*$/.test(val)) {
                setAmount(val);
              }
            }}
            inputMode="decimal"
            placeholder={t('transactions.amount')}
            required
            width="full"
            variant="subtle"
          />
          <SelectRoot
            collection={createListCollection({
              items: currentCategories.map(c => ({ label: c, value: c }))
            })}
            value={[category]}
            onValueChange={(e) => setCategory(e.value[0])}
            variant="subtle"
            width="full"
          >
            <SelectTrigger>
              <SelectValueText placeholder={t('transactions.selectCategory')} />
            </SelectTrigger>
            <SelectContent>
              {currentCategories.map(cat => (
                <SelectItem item={{ label: cat, value: cat }} key={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
          <Input
            variant="subtle"
            placeholder={t('transactions.descriptionPlaceholder')}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <DatePickerRoot
            value={date ? [parseDate(date)] : []}
            onValueChange={(e) => setDate(e.value[0]?.toString() ?? new Date().toISOString().split('T')[0])}
            format={(selectedDate) => formatDateAsDdSlashMMSlashYyyy(selectedDate.toDate('UTC'))}
            parse={(value) => parseDdSlashMMSlashYyyyToDateValue(value)}
            placeholder="dd/MM/yyyy"
            width="full"
            variant="subtle"
          >
            <DatePickerControl>
              <DatePickerInput placeholder="dd/MM/yyyy" />
            </DatePickerControl>
          </DatePickerRoot>

          {!initialData?.isTemplate && (
            <Switch
              colorPalette="blue"
              checked={isRecurring}
              onCheckedChange={(e) => setIsRecurring(e.checked)}
            >
              {t('transactions.makeRecurring')}
            </Switch>
          )}

          {(isRecurring || initialData?.isTemplate) && (
            <SelectRoot
              collection={recurrenceCollection}
              value={[String(recurrenceInterval)]}
              onValueChange={(e) => setRecurrenceInterval(Number(e.value[0]))}
              variant="subtle"
              width="full"
            >
              <SelectTrigger>
                <SelectValueText placeholder={t('transactions.selectInterval')} />
              </SelectTrigger>
              <SelectContent>
                {recurrenceCollection.items.map((item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          )}
          <Row>
            {initialData && initialData.transactionId && onDelete && (
              <DeleteButton type="button" onClick={() => {
                const transactionId = initialData.transactionId;
                if (!transactionId) return;
                onDelete(transactionId);
                onClose();
              }}>
                {t('common.delete')}
              </DeleteButton>
            )}
            <Button type="button" $variant="secondary" onClick={onClose}>{t('common.cancel')}</Button>
            <Button type="submit" $variant="primary">{t('common.save')}</Button>
          </Row>
        </Form>
      </ModalContent>
    </Overlay>
  );
};
