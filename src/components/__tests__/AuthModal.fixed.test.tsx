import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock для useAuth
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithGoogle = jest.fn();

// Mock для sonner - define this AFTER the other mocks
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
};

// Мокаем модули перед импортом компонента
jest.mock('sonner', () => ({
  toast: mockToast,
}));

jest.mock('../AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

// Import component AFTER setting up mocks
import { AuthModal } from '../AuthModal';

describe('AuthModal - Fixed', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderAuthModal = (isOpen = true) => {
    return render(<AuthModal isOpen={isOpen} onClose={mockOnClose} />);
  };

  it('renders sign in form by default', () => {
    renderAuthModal();

    expect(screen.getByTestId('signin-email-input')).toBeInTheDocument();
    expect(screen.getByTestId('signin-password-input')).toBeInTheDocument();
    expect(screen.getByTestId('signin-submit-button')).toBeInTheDocument();
  });

  it('switches to sign up form when tab is clicked', async () => {
    const user = userEvent.setup();
    renderAuthModal();

    // Используем userEvent для более реалистичного клика
    await user.click(screen.getByTestId('signup-tab'));

    // Проверяем, что форма регистрации появилась
    expect(screen.getByTestId('signup-submit-button')).toBeInTheDocument();
    expect(screen.getByTestId('signup-email-input')).toBeInTheDocument();
  });

  it('handles successful sign in', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ success: true });

    renderAuthModal();

    await user.type(screen.getByTestId('signin-email-input'), 'test@example.com');
    await user.type(screen.getByTestId('signin-password-input'), 'password123');
    await user.click(screen.getByTestId('signin-submit-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('handles sign in failure', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ success: false, error: 'Invalid credentials' });

    renderAuthModal();

    await user.type(screen.getByTestId('signin-email-input'), 'test@example.com');
    await user.type(screen.getByTestId('signin-password-input'), 'wrongpassword');
    await user.click(screen.getByTestId('signin-submit-button'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('validates sign up form', async () => {
    const user = userEvent.setup();
    renderAuthModal();

    // Switch to sign up tab first
    await user.click(screen.getByTestId('signup-tab'));

    // Try to submit without filling required fields
    await user.click(screen.getByTestId('signup-submit-button'));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith('Please fill in all fields');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderAuthModal();

    const passwordInput = screen.getByTestId('signin-password-input');
    const toggleButton = screen.getByTestId('toggle-password-visibility');

    // Initially should be password type
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('does not render when isOpen is false', () => {
    const { container } = renderAuthModal(false);
    
    expect(container.querySelector('[data-testid="auth-modal"]')).toBeNull();
  });

  it('handles google sign in', async () => {
    const user = userEvent.setup();
    mockSignInWithGoogle.mockResolvedValue({ success: true });

    renderAuthModal();

    await user.click(screen.getByTestId('google-signin-button'));

    await waitFor(() => {
      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });
  });
});