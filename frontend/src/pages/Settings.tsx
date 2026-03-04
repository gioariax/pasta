import React from 'react';
import styled from 'styled-components';
import { CardRoot, CardBody, Tabs } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiRepeat, FiGrid, FiArrowLeft } from 'react-icons/fi';
import Templates from './Templates';
import { CategoryManager } from '../components/CategoryManager';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const SettingsCard = styled(CardRoot)`
  ${({ theme }) => theme.utils.glass}
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
`;

const Settings: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Container>
            <PageHeader>
                <h1><FiSettings /> Settings</h1>
                <BackButton onClick={() => navigate('/dashboard')}>
                    <FiArrowLeft /> Back to Dashboard
                </BackButton>
            </PageHeader>

            <SettingsCard>
                <CardBody padding="0">
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
                </CardBody>
            </SettingsCard>
        </Container>
    );
};

export default Settings;
