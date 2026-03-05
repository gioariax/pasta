import React, { useState } from 'react';
import styled from 'styled-components';
import { signUp, confirmRegistration } from '../services/cognito';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  ${({ theme }) => theme.utils.glass}
  padding: ${({ theme }) => theme.spacing.md};

  @media (min-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }

  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 16px;
  outline: none;
  transition: background 0.2s;

  &:focus {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
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
    color: ${({ theme }) => theme.colors.primary};
    &:hover {
      text-decoration: underline;
    }
  }
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
