import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../../services/api';
import { useDateStore } from '../../store/dateStore';

const ChartContainer = styled.div`
  ${({ theme }) => theme.utils.glass}
  background: rgba(255, 255, 255, 0.03);
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const Subtitle = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

const DayLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 8px;
`;

const DayCell = styled.div<{ $intensity: number, $isCurrentMonth: boolean, $isToday: boolean }>`
  aspect-ratio: 1;
  border-radius: 4px;
  background-color: ${({ $intensity, $isCurrentMonth }) => {
        if (!$isCurrentMonth) return 'transparent';
        if ($intensity === 0) return 'rgba(255, 255, 255, 0.05)';
        if ($intensity < 0.25) return 'rgba(239, 68, 68, 0.2)';
        if ($intensity < 0.5) return 'rgba(239, 68, 68, 0.4)';
        if ($intensity < 0.75) return 'rgba(239, 68, 68, 0.7)';
        return 'rgba(239, 68, 68, 1)';
    }};
  border: ${({ $isCurrentMonth }) => $isCurrentMonth ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'};
  outline: ${({ $isToday }) => $isToday ? '2px solid white' : 'none'};
  outline-offset: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: ${({ $intensity }) => $intensity > 0.5 ? 'white' : 'rgba(255,255,255,0.6)'};
  cursor: ${({ $isCurrentMonth }) => $isCurrentMonth ? 'pointer' : 'default'};
  transition: transform 0.1s ease;

  &:hover {
    transform: ${({ $isCurrentMonth }) => $isCurrentMonth ? 'scale(1.1)' : 'none'};
    z-index: 10;
  }
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  width: 100%;
`;

const TooltipText = styled.div`
  visibility: hidden;
  width: 120px;
  background-color: rgba(17, 24, 39, 0.9);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  z-index: 20;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
  font-size: 12px;
  pointer-events: none;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  ${TooltipWrapper}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

const LegendContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const LegendBox = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

interface Props {
    transactions: Transaction[]; // Expect current month transactions
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const ExpenseHeatmapChart: React.FC<Props> = ({ transactions }) => {
    const { t } = useTranslation();
    const { selectedMonth, selectedYear } = useDateStore();

    const data = useMemo(() => {
        const expenses = transactions.filter(t => t.type === 'expense');

        // Group by day of the month
        const expensesByDay: Record<number, number> = {};
        let maxExpense = 0;

        expenses.forEach(tx => {
            const d = new Date(tx.date).getDate();
            expensesByDay[d] = (expensesByDay[d] || 0) + tx.amount;
            if (expensesByDay[d] > maxExpense) {
                maxExpense = expensesByDay[d];
            }
        });

        // Generate Calendar Grid
        const firstDay = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

        const today = new Date();
        const isCurrentViewToday = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;
        const currentDay = today.getDate();

        const cells = [];

        // Fill empty cells before the 1st
        for (let i = 0; i < firstDay; i++) {
            cells.push({ day: 0, amount: 0, intensity: 0, isCurrentMonth: false, isToday: false });
        }

        // Fill actual days
        for (let d = 1; d <= daysInMonth; d++) {
            const amount = expensesByDay[d] || 0;
            const intensity = maxExpense > 0 ? amount / maxExpense : 0;
            cells.push({
                day: d,
                amount,
                intensity,
                isCurrentMonth: true,
                isToday: isCurrentViewToday && d === currentDay
            });
        }

        // Fill empty cells after end of month (to keep grid 7 cols even)
        const remainingCells = 7 - (cells.length % 7);
        if (remainingCells < 7) {
            for (let i = 0; i < remainingCells; i++) {
                cells.push({ day: 0, amount: 0, intensity: 0, isCurrentMonth: false, isToday: false });
            }
        }

        return { cells, maxExpense };
    }, [transactions, selectedMonth, selectedYear]);

    return (
        <ChartContainer>
            <Title>{t('dashboard.heatmapTitle', 'Expenditure Intensity')}</Title>
            <Subtitle>{t('dashboard.heatmapSubtitle', 'Deepest red indicates highest spending days of the month')}</Subtitle>

            <Grid>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <DayLabel key={day}>{t(`dashboard.days.${day.toLowerCase()}`, day)}</DayLabel>
                ))}

                {data.cells.map((cell, index) => (
                    <TooltipWrapper key={index}>
                        <DayCell
                            $intensity={cell.intensity}
                            $isCurrentMonth={cell.isCurrentMonth}
                            $isToday={cell.isToday}
                        >
                            {cell.isCurrentMonth ? cell.day : ''}
                        </DayCell>
                        {cell.isCurrentMonth && (
                            <TooltipText>
                                Day {cell.day}<br />
                                <strong>-{formatCurrency(cell.amount)}</strong>
                            </TooltipText>
                        )}
                    </TooltipWrapper>
                ))}
            </Grid>

            <LegendContainer>
                <span>{t('dashboard.less', 'Less')}</span>
                <LegendBox $color="rgba(255, 255, 255, 0.05)" />
                <LegendBox $color="rgba(239, 68, 68, 0.2)" />
                <LegendBox $color="rgba(239, 68, 68, 0.4)" />
                <LegendBox $color="rgba(239, 68, 68, 0.7)" />
                <LegendBox $color="rgba(239, 68, 68, 1)" />
                <span>{t('dashboard.more', 'More')}</span>
            </LegendContainer>
        </ChartContainer>
    );
};
