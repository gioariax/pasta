import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from './ui/select';
import { createListCollection } from '@chakra-ui/react';
import { useDateStore } from '../store/dateStore';
import { useTranslation } from 'react-i18next';
import { FiChevronDown, FiChevronUp, FiCalendar } from 'react-icons/fi';

const Wrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DateDisplayButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 0.8;
  }
`;

const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.3s ease-in-out;
`;

const CollapsibleInner = styled.div`
  overflow: hidden;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

export const DateSelector: React.FC = () => {
    const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useDateStore();
    const { t, i18n } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);

    const yearCollection = useMemo(() => {
        const currentDate = new Date();
        const currentYearNum = currentDate.getFullYear();
        const availableYears = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

        return createListCollection({
            items: availableYears.map(y => ({ label: String(y), value: String(y) }))
        });
    }, []);

    const monthCollection = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(i18n.language, { month: 'long' });
        const items = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(2000, i, 1);
            let name = formatter.format(date);
            name = name.charAt(0).toUpperCase() + name.slice(1);
            return { label: name, value: String(i) };
        });
        return createListCollection({ items });
    }, [i18n.language]);

    // Format current selected date text
    const formatter = new Intl.DateTimeFormat(i18n.language, { month: 'long' });
    const selectedDate = new Date(selectedYear, selectedMonth, 1);
    let monthName = formatter.format(selectedDate);
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    const displayText = `${selectedYear}, ${monthName}`;

    return (
        <Wrapper>
            <DateDisplayButton onClick={() => setIsExpanded(!isExpanded)}>
                <FiCalendar size={24} style={{ color: '#3b82f6' }} />
                {displayText}
                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </DateDisplayButton>

            <CollapsibleContent $isOpen={isExpanded}>
                <CollapsibleInner>
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
                                <SelectValueText placeholder={t('transactions.year')} />
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
                                <SelectValueText placeholder={t('transactions.month')} />
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
                </CollapsibleInner>
            </CollapsibleContent>
        </Wrapper>
    );
};
