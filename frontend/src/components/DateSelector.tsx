import React, { useMemo } from 'react';
import styled from 'styled-components';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from './ui/select';
import { createListCollection } from '@chakra-ui/react';
import { useDateStore } from '../store/dateStore';

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  align-items: center;
`;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const monthCollection = createListCollection({
    items: MONTHS.map((m, idx) => ({ label: m, value: String(idx) }))
});

export const DateSelector: React.FC = () => {
    const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useDateStore();

    const yearCollection = useMemo(() => {
        const currentDate = new Date();
        const currentYearNum = currentDate.getFullYear();
        // Assuming we want a range around the current year
        const availableYears = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1, currentYearNum + 2];

        return createListCollection({
            items: availableYears.map(y => ({ label: String(y), value: String(y) }))
        });
    }, []);

    return (
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
    );
};
