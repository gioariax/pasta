import React, { useState } from 'react';
import styled from 'styled-components';
import pastaLogo from '../assets/pastalogo.svg';
import { signIn, completeNewPassword } from '../services/cognito';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: start;
  height: 100vh;
  background-color: #111111;
`;

const Card = styled.div`
  background: #161616;
  padding: 40px 32px;
  border-bottom-left-radius: 24px;
  border-bottom-right-radius: 24px;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  background: #2b2b2b;
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: background 0.2s;

  &:focus {
    background: #333333;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #05D5AD;
  color: #000000;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  transition: filter 0.2s;

  &:hover {
    filter: brightness(1.1);
  }
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: 16px;
  text-align: center;
`;

const BottomText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: #05D5AD;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
`;

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New Password challenge states
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [cognitoUserObj, setCognitoUserObj] = useState<any>(null);

  const { checkAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await signIn(email, password);
      if (response.status === 'NEW_PASSWORD_REQUIRED') {
        setIsNewPasswordRequired(true);
        setCognitoUserObj(response.cognitoUser);
      } else {
        await checkAuth();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await completeNewPassword(cognitoUserObj, newPassword);
      await checkAuth();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <LogoContainer>
          <Logo src={pastaLogo} alt="Pasta Logo" />
        </LogoContainer>

        {isNewPasswordRequired && <Title>{t('auth.setNewPassword')}</Title>}

        {isNewPasswordRequired ? (
          <form onSubmit={handleNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: '#a3a3a3', fontSize: '14px', textAlign: 'center' }}>
              {t('auth.passwordUpdateRequired')}
            </p>
            <Input
              type="password"
              placeholder={t('auth.newPasswordPlaceholder')}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={loading}>
              {loading ? t('auth.updating') : t('auth.updateAndLogin')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={loading}>
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </Button>
          </form>
        )}

        {!isNewPasswordRequired && (
          <BottomText>
            {t('auth.noAccount')} <Link to="/register">{t('auth.signUpLink')}</Link>
          </BottomText>
        )}
      </Card>
    </Container>
  );
};

export default Login;
