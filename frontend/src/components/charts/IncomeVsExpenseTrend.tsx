import React, { useMemo } from 'react';
import styled from 'styled-components';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../../services/api';

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
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.textPrimary};
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
    transactions: Transaction[]; // Expect all historic transactions here, not just current month
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const IncomeVsExpenseTrend: React.FC<Props> = ({ transactions }) => {
    const { t, i18n } = useTranslation();

    const data = useMemo(() => {
        // Get last 6 months list
        const monthsData: Record<string, { name: string; timestamp: number; income: number; expense: number }> = {};
        const now = new Date();

        // Initialize last 6 months with 0
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${d.getMonth()}`;

            let formattedName = new Intl.DateTimeFormat(i18n.language, { month: 'short' }).format(d);
            formattedName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

            monthsData[key] = {
                name: formattedName,
                timestamp: d.getTime(),
                income: 0,
                expense: 0
            };
        }

        // Populate data
        transactions.forEach(tx => {
            const txDate = new Date(tx.date);
            const key = `${txDate.getFullYear()}-${txDate.getMonth()}`;

            if (monthsData[key]) {
                if (tx.type === 'income') {
                    monthsData[key].income += tx.amount;
                } else {
                    monthsData[key].expense += tx.amount;
                }
            }
        });

        return Object.values(monthsData).sort((a, b) => a.timestamp - b.timestamp);
    }, [transactions, i18n.language]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
            const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
            const net = income - expense;

            return (
                <CustomTooltipContainer>
                    <TooltipLabel>{label}</TooltipLabel>
                    <TooltipRow>
                        <span style={{ color: '#10b981' }}>{t('dashboard.income')}</span>
                        <span style={{ color: 'white' }}>{formatCurrency(income)}</span>
                    </TooltipRow>
                    <TooltipRow>
                        <span style={{ color: '#ef4444' }}>{t('dashboard.expenses')}</span>
                        <span style={{ color: 'white' }}>{formatCurrency(expense)}</span>
                    </TooltipRow>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
                    <TooltipRow>
                        <span style={{ color: '#9ca3af' }}>{t('dashboard.net', 'Net')}</span>
                        <span style={{ color: net >= 0 ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                            {net >= 0 ? '+' : ''}{formatCurrency(net)}
                        </span>
                    </TooltipRow>
                </CustomTooltipContainer>
            );
        }
        return null;
    };

    return (
        <ChartContainer>
            <Title>{t('dashboard.incomeVsExpense', 'Income vs Expense Trends')}</Title>
            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 13 }}
                            dy={10}
                        />
                        <YAxis
                            hide={true}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Legend
                            verticalAlign="top"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span style={{ color: '#e5e7eb', fontSize: '13px' }}>{String(t(`dashboard.${value}`, { defaultValue: value as string }))}</span>}
                        />
                        <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="expense" name="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </ChartContainer>
    );
};
