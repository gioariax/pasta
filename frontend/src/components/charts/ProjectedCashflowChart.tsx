import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
    transactions: Transaction[]; // Must include current balance logic or historic
    suggestedTemplates: Transaction[]; // For forecasting recurrent pending charges
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

export const ProjectedCashflowChart: React.FC<Props> = ({ transactions, suggestedTemplates }) => {
    const { t } = useTranslation();

    const data = useMemo(() => {
        // Current Balance calculation
        const currentIncome = transactions.filter(t => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const currentExpense = transactions.filter(t => t.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const currentBalance = currentIncome - currentExpense;

        // Projected Future
        const pendingIncome = suggestedTemplates.filter(t => t.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
        const pendingExpense = suggestedTemplates.filter(t => t.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
        const endBalance = currentBalance + pendingIncome - pendingExpense;

        return [
            {
                name: t('dashboard.current', 'Current'),
                balance: currentBalance,
                cashFlow: currentBalance,
            },
            {
                name: t('dashboard.pending', 'Pending'),
                income: pendingIncome,
                expense: pendingExpense,
            },
            {
                name: t('dashboard.projected', 'Projected End'),
                balance: endBalance,
                cashFlow: endBalance,
            }
        ];
    }, [transactions, suggestedTemplates, t]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const balance = payload.find((p: any) => p.dataKey === 'balance')?.value;
            const income = payload.find((p: any) => p.dataKey === 'income')?.value;
            const expense = payload.find((p: any) => p.dataKey === 'expense')?.value;

            return (
                <CustomTooltipContainer>
                    <TooltipLabel>{label}</TooltipLabel>
                    {balance !== undefined && (
                        <TooltipRow>
                            <span style={{ color: '#3b82f6' }}>{t('dashboard.balance')}</span>
                            <span style={{ color: 'white' }}>{formatCurrency(balance)}</span>
                        </TooltipRow>
                    )}
                    {income !== undefined && income > 0 && (
                        <TooltipRow>
                            <span style={{ color: '#10b981' }}>{t('dashboard.pendingIncome', 'Pending In')}</span>
                            <span style={{ color: 'white' }}>+{formatCurrency(income)}</span>
                        </TooltipRow>
                    )}
                    {expense !== undefined && expense > 0 && (
                        <TooltipRow>
                            <span style={{ color: '#ef4444' }}>{t('dashboard.pendingExpense', 'Pending Out')}</span>
                            <span style={{ color: 'white' }}>-{formatCurrency(expense)}</span>
                        </TooltipRow>
                    )}
                </CustomTooltipContainer>
            );
        }
        return null;
    };

    return (
        <ChartContainer>
            <Title>{t('dashboard.projectedCashFlow', 'Projected Cash Flow')}</Title>
            <Subtitle>{t('dashboard.cashFlowSubtitle', 'Current balance minus upcoming recurrent expenses')}</Subtitle>
            <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#9ca3af', fontSize: 13 }}
                            dy={10}
                        />
                        <YAxis hide={true} domain={['auto', 'auto']} />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />

                        {/* Render Bars for Balance */}
                        <Bar dataKey="balance" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />

                        {/* Render Bars for Pending (Stacked manually visually) */}
                        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />

                        {/* Render line connecting balances */}
                        <Line type="monotone" dataKey="cashFlow" stroke="#60a5fa" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </ChartContainer>
    );
};
