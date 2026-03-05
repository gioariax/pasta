import React from 'react';
import styled from 'styled-components';
import { Tabs } from '@chakra-ui/react';
import { FiSettings, FiRepeat, FiGrid, FiGlobe } from 'react-icons/fi';
import Templates from './Templates';
import { CategoryManager } from '../components/CategoryManager';
import { useTranslation } from 'react-i18next';
import { createListCollection } from '@chakra-ui/react';
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



const LanguageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
`;

const langCollection = createListCollection({
    items: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' }
    ]
});

const Settings: React.FC = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Container>
            <PageHeader>
                <h1><FiSettings /> {t('common.settings')}</h1>
            </PageHeader>

            <LanguageContainer>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a3a3a3' }}>
                    <FiGlobe size={20} />
                    <span>Language / Idioma:</span>
                </div>
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

            <Tabs.Root defaultValue="categories" variant="enclosed" fitted>
                <Tabs.List bg="rgba(0,0,0,0.2)">
                    <Tabs.Trigger value="categories">
                        <FiGrid /> {t('settings.categories')}
                    </Tabs.Trigger>
                    <Tabs.Trigger value="recurring">
                        <FiRepeat /> {t('settings.recurringTransactions')}
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="categories" p={6}>
                    <CategoryManager />
                </Tabs.Content>

                <Tabs.Content value="recurring" p={6}>
                    <Templates hideHeader={true} />
                </Tabs.Content>
            </Tabs.Root>
        </Container>
    );
};

export default Settings;
