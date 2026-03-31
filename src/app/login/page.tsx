// Login Page for MORIX V2 - Exact from morix_v2_executive_login/code.html
// "The Digital Curator" - Split Screen Design

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, LogIn, UserPlus, Shield, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Password validation rules
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('ต้องมีตัวเลขอย่างน้อย 1 ตัว');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Check for lockout
  const isLockedOut = () => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return true;
    }
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setAttemptCount(0);
    }
    return false;
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutUntil) return 0;
    return Math.ceil((lockoutUntil - Date.now()) / 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPasswordErrors([]);

    // Check lockout
    if (isLockedOut()) {
      const remaining = getRemainingLockoutTime();
      setError(`กรุณารอ ${remaining} วินาที ก่อนลองใหม่`);
      return;
    }

    // Validate email format
    if (!validateEmail(email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง');
      return;
    }

    // Validate password for signup
    if (isSignUp) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        setPasswordErrors(passwordValidation.errors);
        return;
      }
      
      if (password !== confirmPassword) {
        setError('รหัสผ่านไม่ตรงกัน');
        return;
      }
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password);
        
        if (error) {
          setError('สมัครไม่สำเร็จ กรุณาลองใหม่ภายหลัง');
        } else {
          alert('สมัครสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนด้วย (อาจอยู่ใน Spam)');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          const errorMessage = error.message || '';
          const newCount = attemptCount + 1;
          setAttemptCount(newCount);
          
          if (newCount >= 5) {
            setLockoutUntil(Date.now() + 30000);
            setError('มีการพยายามเข้าหลายครั้ง กรุณารอ 30 วินาที');
          } else if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('confirm')) {
            setError('⚠️ กรุณายืนยันอีเมลก่อนเข้าใช้ (เช็ค Inbox/Spam)');
          } else {
            setError(`อีเมลหรือรหัสผ่านไม่ถูกต้อง (ครั้งที่ ${newCount}/5)`);
          }
        } else {
          setAttemptCount(0);
          setLockoutUntil(null);
          router.push('/');
        }
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง');
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { level: 1, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, text: 'Medium', color: 'bg-yellow-500' };
    return { level: 3, text: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-hidden min-h-screen">
      {/* Main Layout: Split Screen */}
      <main className="min-h-screen flex items-stretch">
        
        {/* Left Side: Editorial Imagery */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900">
          {/* Placeholder for image */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-zinc-800 text-8xl font-black tracking-tighter">MORIX</span>
          </div>
          
          {/* Editorial Text - Exact from HTML */}
          <div className="relative z-10 mt-auto p-16 w-full max-w-2xl">
            <div className="mb-6 h-px w-24 bg-primary"></div>
            <h1 className="font-headline text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
              Redefining Executive Management.
            </h1>
            <p className="text-zinc-300 text-lg leading-relaxed max-w-md">
              Experience the precision of Morix V2. A curated ecosystem for the modern leader.
            </p>
          </div>
        </div>
        
        {/* Right Side: Login Interaction Canvas */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-surface-bright relative">
          
          {/* Branding Header */}
          <div className="absolute top-12 left-8 lg:left-16">
            <span className="font-headline text-2xl font-bold tracking-tighter text-zinc-900">
              Morix V2
            </span>
          </div>
          
          {/* Login Card */}
          <div className="w-full max-w-md space-y-8">
            <div className="space-y-2">
              <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-secondary font-medium">
                {isSignUp ? 'Join the executive suite' : 'Continue to your executive suite'}
              </p>
            </div>
            
            {/* Form Section - Exact from HTML */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Security Notice */}
              {!isSignUp && attemptCount > 0 && attemptCount < 5 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    ครั้งที่ {attemptCount}/5 - หากพลาด 5 ครั้ง จะถูกล็อก 30 วินาที
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Email Input */}
                <div className="space-y-1.5">
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider text-secondary ml-1" htmlFor="email">
                    Email Address
                  </label>
                  <input 
                    className="w-full px-5 py-4 bg-surface-container-lowest border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400" 
                    id="email" 
                    placeholder="executive@morix.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                    required
                  />
                </div>
                
                {/* Password Input */}
                <div className="space-y-1.5">
                  <label className="block font-label text-xs font-semibold uppercase tracking-wider text-secondary ml-1" htmlFor="password">
                    Password
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full px-5 py-4 bg-surface-container-lowest border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400" 
                      id="password" 
                      placeholder="••••••••" 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={isSignUp ? 8 : 1}
                    />
                    <button 
                      type="button" 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  
                  {/* Password Strength (Signup only) */}
                  {isSignUp && password && (
                    <div className="mt-3">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.level ? passwordStrength.color : 'bg-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-secondary">Strength: {passwordStrength.text}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password (Signup only) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label className="block font-label text-xs font-semibold uppercase tracking-wider text-secondary ml-1" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input 
                      className="w-full px-5 py-4 bg-surface-container-lowest border-none shadow-sm rounded-xl focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-zinc-400" 
                      id="confirmPassword" 
                      placeholder="••••••••" 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required={isSignUp}
                      minLength={8}
                    />
                  </div>
                )}

                {/* Password Requirements (Signup only) */}
                {isSignUp && passwordErrors.length > 0 && (
                  <div className="p-4 bg-red-50 rounded-2xl">
                    <p className="text-sm text-red-700 font-medium mb-2">Password must have:</p>
                    <ul className="text-xs text-red-600 space-y-1">
                      {passwordErrors.map((err, i) => (
                        <li key={i}>• {err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Remember Me & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input 
                    className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary" 
                    id="remember" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="text-sm font-medium text-secondary" htmlFor="remember">Remember device</label>
                </div>
                <a className="text-sm font-semibold text-primary hover:underline decoration-2 underline-offset-4" href="#">
                  Forgot access?
                </a>
              </div>
              
              {/* Submit Button - Exact from HTML */}
              <button 
                className="w-full py-4 signature-gradient text-white font-bold rounded-full shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading || isLockedOut()}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </form>
            
            {/* Divider - Exact from HTML */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-container-high"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface-bright px-4 text-xs font-bold uppercase tracking-widest text-zinc-400">
                  or continue with
                </span>
              </div>
            </div>
            
            {/* SSO Options - Exact from HTML */}
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center space-x-3 py-3 px-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-sm transition-colors group">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold text-zinc-700">Google</span>
              </button>
              <button className="flex items-center justify-center space-x-3 py-3 px-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl border border-outline-variant/10 shadow-sm transition-colors group">
                <span className="material-symbols-outlined text-xl text-zinc-900">ios</span>
                <span className="font-semibold text-zinc-700">Apple</span>
              </button>
            </div>
            
            {/* Sign Up Link - Exact from HTML */}
            <p className="text-center text-secondary font-medium pt-4">
              {isSignUp ? 'Already have account?' : 'New to the suite?'}{' '}
              <button 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setPasswordErrors([]);
                  setConfirmPassword('');
                }} 
                className="text-primary font-bold hover:underline decoration-2 underline-offset-4"
              >
                {isSignUp ? 'Sign In' : 'Request Access'}
              </button>
            </p>
          </div>
          
          {/* Footer - Exact from HTML */}
          <footer className="absolute bottom-12 w-full px-8 lg:px-16 flex justify-center text-[10px] md:text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <span>© 2026 Morix V2 Executive Suite</span>
          </footer>
        </div>
      </main>
      
      {/* Support Trigger Button - Exact from HTML */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-surface-container-lowest shadow-2xl rounded-full flex items-center justify-center text-primary border border-outline-variant/20 hover:scale-110 transition-transform active:scale-95 z-50">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>help</span>
      </button>
    </div>
  );
}