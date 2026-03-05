import React from 'react';
import styled from 'styled-components';
import { Outlet, NavLink } from 'react-router-dom';
import { FiHome, FiList, FiBarChart2, FiSettings } from 'react-icons/fi';

const LayoutContainer = styled.div`
  min-height: 100vh;
  padding-bottom: 80px; /* Space for the fixed bottom nav */
  background: ${({ theme }) => theme.colors.background};
`;

const ContentWrapper = styled.main`
  max-width: 1200px;
  margin: 0 auto;
`;

const BottomNav = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(39, 39, 42, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom, 0px); /* For iOS rounded corners */
  padding-right: 32px;
  padding-left: 32px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-decoration: none;
  flex: 1;
  height: 100%;
  transition: color 0.2s;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover:not(.active) {
    color: white;
  }

  span {
    font-size: 11px;
    font-weight: 500;
  }
`;

export const AppLayout: React.FC = () => {
  return (
    <LayoutContainer>
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
      <BottomNav>
        <NavItem to="/dashboard" end>
          <FiHome size={22} />
          <span>Overview</span>
        </NavItem>
        <NavItem to="/transactions">
          <FiList size={22} />
          <span>Transactions</span>
        </NavItem>
        <NavItem to="/charts">
          <FiBarChart2 size={22} />
          <span>Charts</span>
        </NavItem>
        <NavItem to="/settings">
          <FiSettings size={22} />
          <span>Settings</span>
        </NavItem>
      </BottomNav>
    </LayoutContainer>
  );
};
