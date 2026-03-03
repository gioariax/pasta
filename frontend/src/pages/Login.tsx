import React, { useState } from 'react';
import styled from 'styled-components';
import pastaLogo from '../assets/pastalogo.svg';
import { signIn, completeNewPassword } from '../services/cognito';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  ${({ theme }) => theme.utils.glass}
  padding: ${({ theme }) => theme.spacing.xl};
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

const Login: React.FC = () => {
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src={pastaLogo} alt="Pasta Logo" style={{ height: '40px' }} />
        </div>
        <Title>{isNewPasswordRequired ? 'Set New Password' : 'Welcome Back'}</Title>

        {isNewPasswordRequired ? (
          <form onSubmit={handleNewPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: '#a3a3a3', fontSize: '14px', textAlign: 'center' }}>
              Your administrator has requested that you update your password.
            </p>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password & Login'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <ErrorText>{error}</ErrorText>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        )}

        {!isNewPasswordRequired && (
          <BottomText>
            Don't have an account? <Link to="/register">Sign up</Link>
          </BottomText>
        )}
      </Card>
    </Container>
  );
};

export default Login;
