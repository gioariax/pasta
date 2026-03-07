import React, { useState } from 'react';
import styled from 'styled-components';
import { FiRepeat, FiGrid, FiGlobe, FiLogOut, FiChevronDown, FiChevronUp, FiPieChart, FiInfo, FiMenu } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import Templates from './Templates';
import { CategoryManager } from '../components/CategoryManager';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
import { Switch } from '../components/ui/switch';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from '../components/ui/select';
import { DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle } from '../components/ui/dialog';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

interface SortableItemProps {
    id: string;
    label: string;
}

const SortableItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.md};
    padding: ${({ theme }) => theme.spacing.md};
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    cursor: grab;
    touch-action: none;
    
    &:active {
        cursor: grabbing;
    }
`;

const SortableItem: React.FC<SortableItemProps> = (props) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <SortableItemContainer ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <FiMenu color="#9ca3af" />
            <span style={{ color: 'white', fontWeight: 500 }}>{props.label}</span>
        </SortableItemContainer>
    );
};

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { logout } = useAuth();
    const { dashboardWidgets, saveWidgets, dashboardLayout, saveLayout } = useSettings();
    const [openSection, setOpenSection] = useState<'categories' | 'recurring' | 'widgets' | 'layout' | null>(null);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);

    const toggleSection = (section: 'categories' | 'recurring' | 'widgets' | 'layout') => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = dashboardLayout.indexOf(active.id as string);
            const newIndex = dashboardLayout.indexOf(over?.id as string);
            const newLayout = arrayMove(dashboardLayout, oldIndex, newIndex);
            saveLayout(newLayout);
        }
    };

    const getLayoutLabel = (key: string) => {
        switch (key) {
            case 'balance': return t('settings.layoutBalance');
            case 'incomeExpense': return t('settings.layoutIncomeExpense');
            case 'projected': return t('settings.layoutProjected');
            case 'charts': return t('settings.layoutCharts');
            case 'suggested': return t('settings.layoutSuggested');
            case 'budgets': return t('settings.layoutBudgets');
            default: return key;
        }
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

                <SectionButton onClick={() => toggleSection('widgets')} style={{ position: 'relative' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPieChart /> {t('settings.dashboardWidgets', 'Dashboard Analytical Charts')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setInfoModalOpen(true);
                            }}
                            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
                            title={t('settings.infoButton', 'Information')}
                        >
                            <FiInfo size={20} />
                        </button>
                        {openSection === 'widgets' ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                </SectionButton>
                <CollapsibleContent $isOpen={openSection === 'widgets'}>
                    <CollapsibleInner>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
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
                        </div>
                    </CollapsibleInner>
                </CollapsibleContent>

                <SectionButton onClick={() => toggleSection('layout')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiGrid /> {t('settings.dashboardLayout', 'Dashboard Layout')}
                    </span>
                    {openSection === 'layout' ? <FiChevronUp /> : <FiChevronDown />}
                </SectionButton>
                <CollapsibleContent $isOpen={openSection === 'layout'}>
                    <CollapsibleInner>
                        <div style={{ padding: '24px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={dashboardLayout}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {dashboardLayout.map((id) => (
                                        <SortableItem key={id} id={id} label={getLayoutLabel(id)} />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    </CollapsibleInner>
                </CollapsibleContent>
            </div>

            <DialogRoot open={isInfoModalOpen} onOpenChange={(e: { open: boolean }) => setInfoModalOpen(e.open)} placement="center" motionPreset="slide-in-bottom">
                <DialogContent style={{ background: 'rgba(17, 24, 39, 0.95)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'white', borderRadius: '16px' }}>
                    <DialogHeader>
                        <DialogTitle>{t('settings.chartsInfoTitle', 'Charts Information')}</DialogTitle>
                    </DialogHeader>
                    <DialogBody style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '24px' }}>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px', color: '#60a5fa' }}>{t('settings.expenseDistribution', 'Expense Distribution')}</strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>{t('settings.expenseDistributionDesc', 'Visualizes how your expenses are distributed across categories.')}</p>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px', color: '#60a5fa' }}>{t('settings.incomeVsExpense', 'Income vs Expense Trends')}</strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>{t('settings.incomeVsExpenseDesc', 'Compares your total income against expenses over the last 6 months.')}</p>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px', color: '#60a5fa' }}>{t('settings.burnRate', 'Burn Rate vs Budget')}</strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>{t('settings.burnRateDesc', 'Tracks your daily cumulative spending against your defined budgets.')}</p>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px', color: '#60a5fa' }}>{t('settings.cashFlow', 'Projected Cash Flow')}</strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>{t('settings.cashFlowDesc', 'Projects your end-of-month balance based on planned recurring transactions.')}</p>
                        </div>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px', color: '#60a5fa' }}>{t('settings.heatmap', 'Expenditure Heatmap')}</strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#d1d5db' }}>{t('settings.heatmapDesc', 'Highlights the days with the highest spending intensity during the month.')}</p>
                        </div>
                    </DialogBody>
                    <DialogCloseTrigger style={{ color: '#9ca3af' }} />
                </DialogContent>
            </DialogRoot>

        </Container>
    );
};

export default Settings;
