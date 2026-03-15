// Login Page for MORIX CRM v2 - SECURE VERSION
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, LogIn, UserPlus, Shield, AlertTriangle } from 'lucide-react';

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
  
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  // Check for lockout
  const isLockedOut = useCallback(() => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return true;
    }
    if (lockoutUntil && Date.now() >= lockoutUntil) {
      setLockoutUntil(null);
      setAttemptCount(0);
    }
    return false;
  }, [lockoutUntil]);

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
          // Don't reveal specific error for security
          console.error('Signup error:', error.code);
          setError('สมัครไม่สำเร็จ กรุณาลองใหม่ภายหลัง');
        } else {
          alert('สมัครสำเร็จ! กรุณาเช็คอีเมลเพื่อยืนด้วย (อาจอยู่ใน Spam)');
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          // Increment attempt count for rate limiting
          const newCount = attemptCount + 1;
          setAttemptCount(newCount);
          
          // Lock out after 5 failed attempts for 30 seconds
          if (newCount >= 5) {
            setLockoutUntil(Date.now() + 30000);
            setError('มีการพยายามเข้าหลายครั้ง กรุณารอ 30 วินาที');
          } else {
            // Generic error message - don't reveal if email or password is wrong
            setError(`อีเมลหรือรหัสผ่านไม่ถูกต้อง (ครั้งที่ ${newCount}/5)`);
          }
        } else {
          // Reset on successful login
          setAttemptCount(0);
          setLockoutUntil(null);
          router.push('/');
        }
      }
    } catch (err) {
      // Don't leak error details to client
      console.error('Auth error:', err);
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
    
    if (score <= 2) return { level: 1, text: 'อ่อน', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, text: 'ปานกลาง', color: 'bg-yellow-500' };
    return { level: 3, text: 'แข็ง', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-orange-600" />
            <h1 className="text-4xl font-bold text-orange-600">MORIX</h1>
          </div>
          <p className="text-gray-600">DECORATIVE</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </h2>

          {/* Security Notice */}
          {!isSignUp && attemptCount > 0 && attemptCount < 5 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-700">
                ครั้งที่ {attemptCount}/5 - หากพลาด 5 ครั้ง จะถูกล็อก 30 วินาที
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                placeholder="example@email.com"
                required
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition pr-12"
                  placeholder="••••••••"
                  required
                  minLength={isSignUp ? 8 : 1}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  disabled={loading || isLockedOut()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Strength (Signup only) */}
              {isSignUp && password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">ความแข็ง: {passwordStrength.text}</p>
                </div>
              )}
            </div>

            {/* Confirm Password (Signup only) */}
            {isSignUp && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ยืนยันรหัสผ่าน
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition"
                  placeholder="••••••••"
                  required={isSignUp}
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </div>
            )}

            {/* Password Requirements (Signup only) */}
            {isSignUp && passwordErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium mb-1">รหัสผ่านต้องมี:</p>
                <ul className="text-xs text-red-600 space-y-1">
                  {passwordErrors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || isLockedOut()}
              className="w-full bg-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  กำลังดำเนินการ...
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                  {isSignUp ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
                </>
              )}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setPasswordErrors([]);
                setConfirmPassword('');
              }}
              className="text-orange-600 hover:text-orange-700 font-medium"
              disabled={loading}
            >
              {isSignUp 
                ? 'มี account อยู่แล้ว? เข้าสู่ระบบ' 
                : 'ยังไม่มี account? สมัครสมาชิก'}
            </button>
          </div>

          {/* Security Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Shield className="w-4 h-4" />
              <span>🔒 ข้อมูลถูกเข้ารหัสด้วย SSL</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © 2026 MORIX DECORATIVE. All rights reserved.
        </p>
      </div>
    </div>
  );
}
