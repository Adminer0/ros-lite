import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  KeyRound,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  Database,
  ExternalLink,
  Sparkles,
  Lock,
  LogOut,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../lib/api';
import { gsapMotion } from '../../lib/animations';

interface NeonAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any | null;
  onAuthSuccess: (user: any) => void;
  onLogout: () => void;
}

export function NeonAuthModal({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}: NeonAuthModalProps) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<any>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      api.getAuthInfo().then(setAuthInfo).catch(console.error);
      if (modalRef.current) {
        gsapMotion.slideNotification(modalRef.current);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (u = username, p = password) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.login(u, p);
      if (res.success && res.user) {
        onAuthSuccess(res.user);
        onClose();
      } else {
        setErrorMessage(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    handleLogin(u, p);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-xs">
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-stone-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm tracking-tight text-white">Neon Auth & Security</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-1.5 py-0.2 rounded">
                  Cloud Active
                </span>
              </div>
              <p className="text-xs text-stone-400">PostgreSQL Session Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Active Session Card if logged in */}
          {currentUser ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">{currentUser.name}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold">
                      @{currentUser.username} • Role: {currentUser.role}
                    </span>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Authenticated
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
                <span className="text-emerald-800 text-[11px]">Authorized for all Owner & Manager modules</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onLogout();
                  }}
                  className="h-7 text-xs border-emerald-300 text-emerald-900 hover:bg-emerald-100 gap-1 font-bold"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 flex items-start gap-2">
              <Lock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-stone-800 block">Sign In Required for Master Access</span>
                <span>Use the designated owner accounts below to manage floor operations, KDS, POS, and financial billing.</span>
              </div>
            </div>
          )}

          {/* Quick 1-Click Login Shortcuts requested by user */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
              Quick 1-Click Owner Credentials
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin')}
                disabled={isLoading}
                className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-900 group-hover:text-emerald-900">
                    admin
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                    OWNER
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">Password: admin</span>
                <span className="text-[10px] text-emerald-700 font-bold block mt-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Sign in as admin
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('yiic', 'yiic')}
                disabled={isLoading}
                className="p-2.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-900 group-hover:text-emerald-900">
                    yiic
                  </span>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                    OWNER
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 block mt-0.5 font-mono">Password: yiic</span>
                <span className="text-[10px] text-purple-700 font-bold block mt-1.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Sign in as yiic
                </span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-3 pt-2 border-t border-stone-200"
          >
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or yiic"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-semibold"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-9 mt-2"
            >
              {isLoading ? 'Authenticating with Neon DB...' : 'Authenticate Account'}
            </Button>
          </form>

          {/* Connected Neon DB Details */}
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200 text-[11px] text-stone-600 space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-stone-800 font-bold">
              <span className="flex items-center gap-1 font-sans">
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                Database Configuration
              </span>
              <span className="text-emerald-700 font-sans font-bold">PostgreSQL 16 (Neon)</span>
            </div>
            <div className="truncate text-stone-500 text-[10px]">
              Host: ep-lucky-dawn-b316vq3o.c-4.ap-southeast-1.aws.neon.tech
            </div>
            <div className="truncate text-stone-500 text-[10px]">
              Auth URL: https://ep-lucky-dawn-b316vq3o.neonauth...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
