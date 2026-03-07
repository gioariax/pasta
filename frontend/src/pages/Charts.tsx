import React from 'react';
import styled from 'styled-components';
import { DateSelector } from '../components/DateSelector';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;


const Charts: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Header />
      <DateSelector />
      <p style={{ marginTop: '16px' }}>{t('charts.placeholder')}</p>
    </Container>
  );
};

export default Charts;
