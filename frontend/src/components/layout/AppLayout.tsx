import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FiEye, FiList, FiSettings } from 'react-icons/fi';

import { useTranslation } from 'react-i18next';

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
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  min-width: 320px;
  height: 58px;
  background: rgba(23, 23, 23, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 32px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  padding: 0 4px;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  border-radius: 24px;
  padding: 8px 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 48px;
  position: relative;
  z-index: 1;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover:not(.active) {
    color: white;
    background: rgba(255, 255, 255, 0.05);
  }

  span {
    font-size: 10px;
    font-weight: 500;
    margin-top: 2px;
  }
`;

const ActivePill = styled.div`
  position: absolute;
  top: 4px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  pointer-events: none;
`;

export const AppLayout: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    // Timeout to allow DOM to render and fonts/translations to apply
    const timer = setTimeout(() => {
      if (!navRef.current) return;
      const activeEl = navRef.current.querySelector('.active') as HTMLElement;
      if (activeEl) {
        setPillStyle({
          left: activeEl.offsetLeft,
          width: activeEl.offsetWidth,
          opacity: 1
        });
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [location.pathname, t]);

  return (
    <LayoutContainer>
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
      <BottomNav ref={navRef}>
        <ActivePill style={pillStyle} />
        <NavItem to="/dashboard" end>
          <FiEye size={32} />
          <span>{t('common.overview')}</span>
        </NavItem>
        <NavItem to="/transactions">
          <FiList size={32} />
          <span>{t('common.transactions')}</span>
        </NavItem>
        {/* <NavItem to="/charts">
          <FiBarChart2 size={22} />
          <span>{t('common.charts')}</span>
        </NavItem> */}
        <NavItem to="/settings">
          <FiSettings size={32} />
          <span>{t('common.settings')}</span>
        </NavItem>
      </BottomNav>
    </LayoutContainer>
  );
};
