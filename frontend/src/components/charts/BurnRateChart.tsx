import React, { useMemo } from 'react';
import styled from 'styled-components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { Transaction, Category } from '../../services/api';

const ChartContainer = styled.div`
  ${({ theme }) => theme.utils.glass}
  background: rgba(255, 255, 255, 0.03);
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 350px;
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

const CustomTooltipContainer = styled.div`
  background: rgba(17, 24, 39, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
  backdrop-filter: blur(8px);
`;

const TooltipLabel = styled.p`
  margin: 0 0 8px 0;
  font-weight: 600;
  color: white;
`;

const TooltipRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 4px;
  font-size: 13px;
`;

interface Props {
    transactions: Transaction[]; // Expect current month transactions
    categories: Category[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const BurnRateChart: React.FC<Props> = ({ transactions, categories }) => {
    const { t } = useTranslation();

    const data = useMemo(() => {
        // Total budget across all tracked categories
        const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
        if (totalBudget === 0) return { chartData: [], totalBudget: 0 }; // Cannot show burn rate without budgets

        const expenses = transactions.filter(t => t.type === 'expense');

        // Create an array mapping days of the current month
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();

        // Group expenses by day
        const expensesByDay: Record<number, number> = {};
        expenses.forEach(tx => {
            const d = new Date(tx.date).getDate();
            expensesByDay[d] = (expensesByDay[d] || 0) + tx.amount;
        });

        const chartData = [];
        let cumulativeExpense = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            // Expected burn (linear)
            const expectedBurn = (totalBudget / daysInMonth) * day;

            // Actual burn (only up to current day)
            if (day <= currentDay) {
                cumulativeExpense += (expensesByDay[day] || 0);
                chartData.push({
                    day: day.toString(),
                    expected: expectedBurn,
                    actual: cumulativeExpense
                });
            } else {
                // Projecting the rest of the month visually
                chartData.push({
                    day: day.toString(),
                    expected: expectedBurn,
                    actual: null // Don't plot actual future expenses
                });
            }
        }

        return { chartData, totalBudget };
    }, [transactions, categories]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const actual = payload.find((p: any) => p.dataKey === 'actual')?.value;
            const expected = payload.find((p: any) => p.dataKey === 'expected')?.value;

            return (
                <CustomTooltipContainer>
                    <TooltipLabel>{t('dashboard.day')} {label}</TooltipLabel>
                    {actual !== null && actual !== undefined && (
                        <TooltipRow>
                            <span style={{ color: '#ef4444' }}>{t('dashboard.actualSpend', 'Spent')}</span>
                            <span style={{ color: 'white' }}>{formatCurrency(actual)}</span>
                        </TooltipRow>
                    )}
                    <TooltipRow>
                        <span style={{ color: '#3b82f6' }}>{t('dashboard.expectedSpend', 'Expected')}</span>
                        <span style={{ color: 'white' }}>{formatCurrency(expected)}</span>
                    </TooltipRow>
                </CustomTooltipContainer>
            );
        }
        return null;
    };

    if (data.totalBudget === 0) return null;

    return (
        <ChartContainer>
            <Title>{t('dashboard.burnRate', 'Burn Rate vs Budget')}</Title>
            <Subtitle>{t('dashboard.burnRateSubtitle', 'Cumulative month spend vs ideal budget trajectory')}</Subtitle>
            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="day"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 12 }}
                            minTickGap={20}
                            dy={10}
                        />
                        <YAxis hide={true} domain={[0, data.totalBudget * 1.1]} />
                        <Tooltip content={<CustomTooltip />} />

                        {/* Ideal Budget Line */}
                        <Area
                            type="monotone"
                            dataKey="expected"
                            stroke="#3b82f6"
                            strokeDasharray="5 5"
                            fill="none"
                            strokeWidth={2}
                        />

                        {/* Actual Spend Area */}
                        <Area
                            type="monotone"
                            dataKey="actual"
                            stroke="#ef4444"
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            strokeWidth={3}
                            connectNulls={false}
                        />
                        <ReferenceLine y={data.totalBudget} stroke="rgba(255, 255, 255, 0.2)" strokeDasharray="3 3" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </ChartContainer>
    );
};
