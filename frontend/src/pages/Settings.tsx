import React, { useState } from 'react';
import styled from 'styled-components';
import { FiRepeat, FiGrid, FiGlobe, FiLogOut, FiChevronDown, FiChevronUp, FiPieChart } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Templates from './Templates';
import { CategoryManager } from '../components/CategoryManager';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { Switch } from '../components/ui/switch';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from '../components/ui/select';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};

  h1 {
    font-size: 28px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 8px 16px;
  background-color: ${({ theme, $primary }) => $primary ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ theme, $primary }) => ($primary ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.2)')};
  }
`;

const LanguageContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const LanguageLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 600;
`;

const SectionButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  display: grid;
  grid-template-rows: ${({ $isOpen }) => ($isOpen ? '1fr' : '0fr')};
  transition: grid-template-rows 0.3s ease-in-out;
  margin-bottom: ${({ theme, $isOpen }) => ($isOpen ? theme.spacing.xl : theme.spacing.sm)};
`;

const CollapsibleInner = styled.div`
  overflow: hidden;
`;

const langCollection = createListCollection({
    items: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' }
    ]
});

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const { dashboardWidgets, saveWidgets } = useSettings();
    const [openSection, setOpenSection] = useState<'categories' | 'recurring' | 'widgets' | null>(null);

    const toggleSection = (section: 'categories' | 'recurring' | 'widgets') => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Container>
            <PageHeader>
                <div />
                <Button
                    onClick={logout}
                    style={{
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                >
                    <FiLogOut /> {t('layout.signOut')}
                </Button>
            </PageHeader>

            <LanguageContainer>
                <LanguageLabel>
                    <FiGlobe size={20} />
                    <span>{t('settings.language')}</span>
                </LanguageLabel>
                <SelectRoot
                    size="md"
                    width="160px"
                    collection={langCollection}
                    value={[i18n.language]}
                    onValueChange={(e) => changeLanguage(e.value[0])}
                    variant="subtle"
                >
                    <SelectTrigger>
                        <SelectValueText placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                        {langCollection.items.map((item) => (
                            <SelectItem item={item} key={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </SelectRoot>
            </LanguageContainer>

            <div>
                <SectionButton onClick={() => toggleSection('categories')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiGrid /> {t('settings.categories')}
                    </span>
                    {openSection === 'categories' ? <FiChevronUp /> : <FiChevronDown />}
                </SectionButton>
                <CollapsibleContent $isOpen={openSection === 'categories'}>
                    <CollapsibleInner>
                        <CategoryManager />
                    </CollapsibleInner>
                </CollapsibleContent>

                <SectionButton onClick={() => toggleSection('recurring')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiRepeat /> {t('settings.recurringTransactions')}
                    </span>
                    {openSection === 'recurring' ? <FiChevronUp /> : <FiChevronDown />}
                </SectionButton>
                <CollapsibleContent $isOpen={openSection === 'recurring'}>
                    <CollapsibleInner>
                        <Templates hideHeader={true} />
                    </CollapsibleInner>
                </CollapsibleContent>

                <SectionButton onClick={() => toggleSection('widgets')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPieChart /> {t('settings.dashboardWidgets', 'Dashboard Analytical Charts')}
                    </span>
                    {openSection === 'widgets' ? <FiChevronUp /> : <FiChevronDown />}
                </SectionButton>
                <CollapsibleContent $isOpen={openSection === 'widgets'}>
                    <CollapsibleInner style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                        <Switch
                            checked={dashboardWidgets.expenseDistribution}
                            onCheckedChange={(e) => saveWidgets({ ...dashboardWidgets, expenseDistribution: e.checked })}
                        >
                            {t('settings.expenseDistribution', 'Expense Distribution (Donut Chart)')}
                        </Switch>

                        <Switch
                            checked={dashboardWidgets.incomeVsExpense}
                            onCheckedChange={(e) => saveWidgets({ ...dashboardWidgets, incomeVsExpense: e.checked })}
                        >
                            {t('settings.incomeVsExpense', 'Income vs Expense Trends')}
                        </Switch>

                        <Switch
                            checked={dashboardWidgets.burnRate}
                            onCheckedChange={(e) => saveWidgets({ ...dashboardWidgets, burnRate: e.checked })}
                        >
                            {t('settings.burnRate', 'Burn Rate vs Budget Constraints')}
                        </Switch>

                        <Switch
                            checked={dashboardWidgets.cashFlow}
                            onCheckedChange={(e) => saveWidgets({ ...dashboardWidgets, cashFlow: e.checked })}
                        >
                            {t('settings.cashFlow', 'Projected Cash Flow')}
                        </Switch>

                        <Switch
                            checked={dashboardWidgets.heatmap}
                            onCheckedChange={(e) => saveWidgets({ ...dashboardWidgets, heatmap: e.checked })}
                        >
                            {t('settings.heatmap', 'Expenditure Intensity Heatmap')}
                        </Switch>
                    </CollapsibleInner>
                </CollapsibleContent>
            </div>
        </Container>
    );
};

export default Settings;
