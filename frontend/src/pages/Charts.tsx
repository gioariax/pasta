import React from 'react';
import styled from 'styled-components';
import { FiBarChart2 } from 'react-icons/fi';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Charts: React.FC = () => {
    return (
        <Container>
            <Header>
                <Title><FiBarChart2 /> Charts</Title>
            </Header>
            <p>Analytical charts will go here.</p>
        </Container>
    );
};

export default Charts;
