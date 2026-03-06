import React, { useState } from 'react';
import styled from 'styled-components';
import { signUp, confirmRegistration } from '../services/cognito';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import pastaLogo from '../assets/pastalogo.svg';

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
  border-radius: 24px;
  width: 100%;
  max-width: 400px;
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
  background-color: #5ef093;
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
  font-size: 14px;
  text-align: center;
`;

const SuccessText = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: 14px;
  text-align: center;
`;

const BottomText = styled.p`
  text-align: center;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  a {
    color: #5ef093;
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

const Register: React.FC = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password);
      setSuccess('Registration successful! Please check your email for the verification code.');
      setStep('confirm');
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await confirmRegistration(email, code);
      setSuccess('Email verified! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to verify code');
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
        <Title>{step === 'register' ? t('auth.createAccount') : t('auth.verifyEmail')}</Title>
        {success && <SuccessText>{success}</SuccessText>}
        {error && <ErrorText>{error}</ErrorText>}

        {step === 'register' ? (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <Button type="submit" disabled={loading}>
              {loading ? t('auth.registering') : t('auth.signUp')}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              type="text"
              placeholder={t('auth.verificationCode')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? t('auth.verifying') : t('auth.verify')}
            </Button>
          </form>
        )}

        {step === 'register' && (
          <BottomText>
            {t('auth.haveAccount')} <Link to="/login">{t('auth.signInLink')}</Link>
          </BottomText>
        )}
      </Card>
    </Container>
  );
};

export default Register;
