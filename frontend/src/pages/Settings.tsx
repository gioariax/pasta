import React from 'react';
import styled from 'styled-components';
import { Tabs } from '@chakra-ui/react';
import { FiSettings, FiRepeat, FiGrid } from 'react-icons/fi';
import Templates from './Templates';
import { CategoryManager } from '../components/CategoryManager';

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



const Settings: React.FC = () => {
    return (
        <Container>
            <PageHeader>
                <h1><FiSettings /> Settings</h1>
            </PageHeader>

            <Tabs.Root defaultValue="categories" variant="enclosed" fitted>
                <Tabs.List bg="rgba(0,0,0,0.2)">
                    <Tabs.Trigger value="categories">
                        <FiGrid /> Categories
                    </Tabs.Trigger>
                    <Tabs.Trigger value="recurring">
                        <FiRepeat /> Recurring Transactions
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
