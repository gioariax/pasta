import React, { useState } from 'react';
import styled from 'styled-components';
import { useSettings } from '../contexts/SettingsContext';
import type { Category } from '../services/api';
import { IconRenderer } from './IconRenderer';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { SelectRoot, SelectTrigger, SelectValueText, SelectContent, SelectItem } from './ui/select';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';

const POPULAR_ICONS = [
    'FiHome', 'FiShoppingBag', 'FiZap', 'FiTruck', 'FiFilm', 'FiHeart', 'FiShoppingCart',
    'FiCoffee', 'FiMonitor', 'FiTag', 'FiDollarSign', 'FiBriefcase', 'FiTrendingUp', 'FiGift',
    'FiAward', 'FiGlobe', 'FiTool', 'FiSmile', 'FiStar', 'FiActivity', 'FiKey', 'FiCamera',
    'FiHeadphones', 'FiBook', 'FiMoreHorizontal'
];

const Container = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Button = styled.button<{ $primary?: boolean, $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: ${({ theme, $primary, $danger }) =>
        $danger ? theme.colors.danger :
            $primary ? theme.colors.primary : 'rgba(255, 255, 255, 0.1)'};
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, $primary, $danger }) =>
        $danger ? '#be123c' : // darker red
            $primary ? theme.colors.primaryHover : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const CategoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CategoryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
`;

const InfoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconBox = styled.div<{ $type: 'income' | 'expense' }>`
  padding: 10px;
  background: ${({ $type }) => $type === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)'};
  border-radius: 12px;
  display: flex;
`;

const CatName = styled.div`
  font-weight: 500;
  font-size: 16px;
`;

const CatType = styled.div<{ $type: 'income' | 'expense' }>`
  font-size: 12px;
  color: ${({ theme, $type }) => $type === 'income' ? theme.colors.success : theme.colors.danger};
  text-transform: capitalize;
`;

const ActionsGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 8px;
  color: ${({ theme, $danger }) => $danger ? theme.colors.danger : theme.colors.textSecondary};
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: ${({ $danger }) => $danger ? '#be123c' : 'white'};
  }
`;

// Editor Subcomponents
const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: #27272a;
  border: 1px solid transparent;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #a1a1aa;
`;

const IconsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 8px;
  margin-top: 8px;
`;

const IconOption = styled.button<{ $selected: boolean }>`
  padding: 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $selected, theme }) => $selected ? theme.colors.primary : 'rgba(255,255,255,0.05)'};
  color: white;
  transition: all 0.2s;

  &:hover {
    background: ${({ $selected, theme }) => $selected ? theme.colors.primaryHover : 'rgba(255,255,255,0.1)'};
  }
`;

export const CategoryManager: React.FC = () => {
    const { t } = useTranslation();
    const { categories, saveCategories } = useSettings();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Category>>({});
    const [isAddingMode, setIsAddingMode] = useState(false);

    const handleEditClick = (category: Category) => {
        setEditingId(category.id);
        setEditForm(category);
        setIsAddingMode(false);
    };

    const handleAddClick = () => {
        setIsAddingMode(true);
        setEditingId(null);
        setEditForm({ name: '', type: 'expense', icon: 'FiTag' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAddingMode(false);
        setEditForm({});
    };

    const handleSave = async () => {
        if (!editForm.name || !editForm.type || !editForm.icon) return;

        let updatedCategories = [...categories];

        if (isAddingMode) {
            const newCategory: Category = {
                id: Date.now().toString(),
                name: editForm.name,
                type: editForm.type as 'income' | 'expense',
                icon: editForm.icon
            };
            updatedCategories.push(newCategory);
        } else if (editingId) {
            updatedCategories = updatedCategories.map(c =>
                c.id === editingId ? { ...c, ...editForm } as Category : c
            );
        }

        await saveCategories(updatedCategories);
        handleCancel();
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('settings.deleteCategoryConfirm'))) {
            const updatedCategories = categories.filter(c => c.id !== id);
            await saveCategories(updatedCategories);
        }
    };

    const renderEditor = () => {
        const typeCollection = createListCollection({
            items: [
                { label: t('common.expense'), value: 'expense' },
                { label: t('common.income'), value: 'income' }
            ]
        });

        return (
            <EditorContainer>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <Label>{t('settings.name')}</Label>
                        <Input
                            value={editForm.name || ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm({ ...editForm, name: e.target.value })}
                            placeholder={t('settings.categoryNamePlaceholder')}
                        />
                    </div>
                    <div style={{ width: '150px' }}>
                        <Label>{t('settings.type')}</Label>
                        <SelectRoot
                            collection={typeCollection}
                            value={[editForm.type || 'expense']}
                            onValueChange={(e) => setEditForm({ ...editForm, type: e.value[0] as 'income' | 'expense' })}
                            variant="subtle"
                        >
                            <SelectTrigger>
                                <SelectValueText placeholder={t('settings.typePlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                                {typeCollection.items.map((item) => (
                                    <SelectItem item={item} key={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </div>
                </div>

                <div>
                    <Label>{t('settings.selectIcon')}</Label>
                    <IconsGrid>
                        {POPULAR_ICONS.map(iconName => (
                            <IconOption
                                key={iconName}
                                $selected={editForm.icon === iconName}
                                onClick={() => setEditForm(prev => ({ ...prev, icon: iconName }))}
                                title={iconName}
                            >
                                <IconRenderer name={iconName} size={20} />
                            </IconOption>
                        ))}
                    </IconsGrid>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                    <Button onClick={handleCancel}>{t('common.cancel')}</Button>
                    <Button $primary onClick={handleSave}>{t('settings.saveCategory')}</Button>
                </div>
            </EditorContainer>
        );
    };

    return (
        <Container>
            <HeaderContainer>
                {!isAddingMode && (
                    <Button $primary onClick={handleAddClick}>
                        <FiPlus /> {t('settings.newCategory')}
                    </Button>
                )}
            </HeaderContainer>

            {isAddingMode && renderEditor()}

            <CategoryList>
                {categories.map(cat => (
                    <React.Fragment key={cat.id}>
                        {editingId === cat.id ? (
                            renderEditor()
                        ) : (
                            <CategoryItem>
                                <InfoGroup>
                                    <IconBox $type={cat.type}>
                                        <IconRenderer name={cat.icon} color={cat.type === 'income' ? '#10b981' : '#f43f5e'} />
                                    </IconBox>
                                    <div>
                                        <CatName>{cat.name}</CatName>
                                        <CatType $type={cat.type}>{cat.type}</CatType>
                                    </div>
                                </InfoGroup>

                                <ActionsGroup>
                                    <IconButton onClick={() => handleEditClick(cat)}>
                                        <FiEdit2 />
                                    </IconButton>
                                    <IconButton $danger onClick={() => handleDelete(cat.id)}>
                                        <FiTrash2 />
                                    </IconButton>
                                </ActionsGroup>
                            </CategoryItem>
                        )}
                    </React.Fragment>
                ))}
            </CategoryList>
        </Container>
    );
};
