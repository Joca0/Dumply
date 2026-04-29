import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Navigate } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { setup2FA, confirm2FA, requestDisable2FA, confirmDisable2FA, logout, changePassword } from '../api';
import { toast } from 'sonner';
import {
  Home,
  Map as MapIcon,
  Truck,
  CalendarClock,
  Users,
  Box,
  Receipt,
  Plus,
  Menu,
  X,
  LogOut,
  ChevronRight,
  LayoutDashboard,
  CheckCircle,
  Shield,
  User,
  ShieldOff,
  Mail,
  Loader2,
  Lock,
  Key,
  Eye,
  EyeOff
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, clearToken, loading, refreshUser } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 1024);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [twoFactorStep, setTwoFactorStep] = useState('idle');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();

  const userInitial = (user?.fullName?.charAt(0) || user?.name?.charAt(0) || '?').toUpperCase();

  const handleStart2FA = async () => {
    try {
      const res = await setup2FA();
      setQrCodeUrl(res.data.qrCodeUrl);
      setTwoFactorStep('setup');
    } catch {
      toast.error("Erro ao configurar o 2FA. Tente novamente.");
    }
  }

  const handleConfirm2FA = async () => {
    try {
      await confirm2FA(otpCode);
      toast.success("2FA ativado com sucesso!");
      await refreshUser();
      setTwoFactorStep('idle');
      setIsProfileOpen(false);
    } catch {
      toast.error("Código inválido. Tente novamente.");
    }
  }

  const handleRequestDisable2FA = async () => {
    setIsSubmitting(true);
    try {
      await requestDisable2FA();
      toast.success("Código de desativação enviado para seu e-mail.");
      setTwoFactorStep('disable-confirm');
      setOtpCode('');
    } catch {
      toast.error("Erro ao solicitar desativação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleConfirmDisable2FA = async () => {
    setIsSubmitting(true);
    try {
      await confirmDisable2FA(otpCode);
      toast.success("2FA desativado com sucesso.");
      await refreshUser();
      setTwoFactorStep('idle');
      setIsProfileOpen(false);
    } catch {
      toast.error("Código de verificação inválido.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success("Senha alterada com sucesso!");
      setTwoFactorStep('idle');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      // Erro tratado pelo interceptor (ex: senha antiga incorreta)
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao realizar logout. Tente novamente.");
      console.error("Logout error:", error);
    } finally {
      clearToken();
    }
  }

  const rolePermissions = {
    DRIVER: ['/map', '/assigned'],
    ADMIN: ['/map', '/dashboard', '/rentals', '/customers', '/equipments', '/invoices', '/scheduled'],
    OWNER: ['/map', '/dashboard', '/rentals', '/customers', '/equipments', '/invoices', '/scheduled'],
  };

  const isAllowed = (to) => {
    if (!user) return false;
    if (['ADMIN', 'OWNER', 'MANAGER'].includes(user.role)) return true;
    return rolePermissions[user.role]?.includes(to);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuGroups = [
    {
      label: 'Visão Geral',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/map', icon: MapIcon, label: 'Mapa em Tempo Real' },
        { to: '/assigned', icon: Truck, label: 'Atribuições' },
      ]
    },
    {
      label: 'Operação',
      items: [
        { to: '/rentals', icon: Truck, label: 'Locações Ativas' },
        { to: '/scheduled', icon: CalendarClock, label: 'Agendamentos' },
        { to: '/customers', icon: Users, label: 'Base de Clientes' },
        { to: '/equipments', icon: Box, label: 'Inventário' },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { to: '/invoices', icon: Receipt, label: 'Faturas' },
      ]
    },
    {
      label: 'Equipe',
      items: [
        { to: '/drivers', icon: Truck, label: 'Motoristas' },
        { to: '/managers', icon: Users, label: 'Gerentes' },
      ]
    }
  ];

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" replace />;

  return (
      <div className="flex h-screen bg-gray-950 overflow-hidden text-gray-100 font-sans">

        {/* --- SIDEBAR (DESKTOP) --- */}
        <aside className={`hidden lg:flex flex-col border-r border-gray-800 bg-gray-900 transition-all duration-300 relative z-20 ${isSidebarOpen ? 'w-72' : 'w-20'}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800">
            {isSidebarOpen ? (
                <>
                  <span className="font-bold text-xl tracking-tight text-white">Dumply<span className="text-blue-500">.</span></span>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors"><Menu size={20} /></button>
                </>
            ) : (
                <button onClick={() => setSidebarOpen(true)} className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mx-auto hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"><Menu size={20} /></button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
            <div className="px-3">
              <NavLink 
                to="/rentals/new" 
                title={!isSidebarOpen ? "Criar Locação" : ""}
                className={`flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 ${isSidebarOpen ? 'p-3 w-full' : 'w-10 h-10 mx-auto relative group'}`}
              >
                <Plus size={20} />
                {isSidebarOpen && <span>Criar Locação</span>}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-800 shadow-xl pointer-events-none">
                    Criar Locação
                  </div>
                )}
              </NavLink>
            </div>

            {menuGroups.map((group, idx) => (
                <div key={idx}>
                  {isSidebarOpen && <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{group.label}</h3>}
                  <div className="space-y-1">
                    {group.items.filter(item => isAllowed(item.to)).map((item) => (
                        <NavLink 
                          key={item.to} 
                          to={item.to} 
                          title={!isSidebarOpen ? item.label : ""}
                          className={({ isActive }) => `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}
                        >
                          <item.icon size={20} className="min-w-[20px]" />
                          {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                          {!isSidebarOpen && (
                            <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-gray-800 shadow-xl pointer-events-none">
                              {item.label}
                            </div>
                          )}
                        </NavLink>
                    ))}
                  </div>
                </div>
            ))}
          </div>

          {/* USUÁRIO LOGADO */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center gap-3 p-2 hover:bg-gray-800 rounded-xl transition-all group border border-transparent hover:border-gray-700">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shrink-0 shadow-lg shadow-blue-900/20">
                {userInitial}
              </div>
              {isSidebarOpen && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-white truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                  </div>
              )}
            </button>
          </div>
        </aside>

        {/* PROFILE MODAL */}
        <Dialog open={isProfileOpen} onClose={() => { setIsProfileOpen(false); setTwoFactorStep('idle'); }} className="relative z-50">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl text-white">
              <div className="flex justify-between items-center mb-6">
                <Dialog.Title className="text-xl font-bold">Minha Conta</Dialog.Title>
                <button onClick={() => setIsProfileOpen(false)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"><X size={20} /></button>
              </div>

              {twoFactorStep === 'idle' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 flex items-center gap-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-lg truncate">{user?.fullName}</p>
                        <p className="text-sm text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 text-gray-300 transition-all border border-transparent hover:border-gray-700">
                        <User size={18} className="text-blue-400" />
                        <span className="flex-1 text-left text-sm font-medium">Editar Perfil (Seção em desenvolvimento)</span>
                        <ChevronRight size={16} className="text-gray-600" />
                      </button>

                      <button onClick={() => setTwoFactorStep('change-password')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 text-gray-300 transition-all border border-transparent hover:border-gray-700">
                        <Lock size={18} className="text-orange-400" />
                        <span className="flex-1 text-left text-sm font-medium">Alterar Senha</span>
                        <ChevronRight size={16} className="text-gray-600" />
                      </button>

                      <button onClick={user?.is2faEnabled ? () => setTwoFactorStep('disable-request') : handleStart2FA} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 text-gray-300 transition-all border border-transparent hover:border-gray-700">
                        <Shield size={18} className={user?.is2faEnabled ? "text-green-400" : "text-gray-400"} />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium">Segurança (2FA)</p>
                          <p className="text-xs text-gray-400">{user?.is2faEnabled ? "Ativado" : "Proteja sua conta"}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-600" />
                      </button>
                    </div>

                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all font-bold text-sm mt-4">
                      <LogOut size={18} /> Sair da Conta
                    </button>
                  </div>
              ) : twoFactorStep === 'change-password' ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <Lock className="text-orange-500" size={20} />
                      </div>
                      <h3 className="font-bold text-lg">Alterar Minha Senha</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="group relative">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Senha Atual</label>
                        <div className="relative">
                          <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          <input
                              type={showPassword ? "text" : "password"}
                              required
                              className="w-full bg-gray-950 border border-gray-800 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={passwordForm.oldPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="group relative">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Nova Senha</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          <input
                              type={showPassword ? "text" : "password"}
                              required
                              className="w-full bg-gray-950 border border-gray-800 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="group relative">
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Confirmar Nova Senha</label>
                        <div className="relative">
                          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                          <input
                              type={showPassword ? "text" : "password"}
                              required
                              className="w-full bg-gray-950 border border-gray-800 p-3 pl-10 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                      <button 
                        type="button"
                        onClick={() => {
                          setTwoFactorStep('idle');
                          setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                        }} 
                        className="p-3 rounded-xl bg-gray-800 font-bold text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-blue-600 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Salvar Senha"}
                      </button>
                    </div>
                  </form>
              ) : twoFactorStep === 'setup' ? (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                      <Shield size={32} className="text-blue-500 mx-auto mb-2" />
                      <h3 className="font-bold text-lg text-white">Configuração Multi-fator 2FA</h3>
                      <p className="text-gray-400 text-sm px-4">
                        Escaneie o QR Code no seu aplicativo de autenticação (Google Authenticator ou Authy).
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-2xl"><QRCodeSVG value={qrCodeUrl} size={160} /></div>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={() => setTwoFactorStep('idle')} className="p-3 rounded-xl bg-gray-800 font-bold">Voltar</button>
                      <button onClick={handleConfirm2FA} className="p-3 rounded-xl bg-blue-600 font-bold flex items-center justify-center gap-2"><CheckCircle size={18} /> Ativar</button>
                    </div>
                  </div>
              ) : twoFactorStep === 'disable-request' ? (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                      <ShieldOff size={32} className="text-red-500 mx-auto mb-2" />
                      <h3 className="font-bold text-lg text-white">Desativar 2FA</h3>
                      <p className="text-gray-400 text-sm px-4">
                        Para desativar a autenticação de dois fatores, enviaremos um código de segurança para seu e-mail.
                      </p>
                    </div>
                    <div className="p-6 bg-gray-800/40 rounded-2xl border border-gray-700/50 w-full">
                        <Mail className="mx-auto text-blue-400 mb-2" size={24} />
                        <p className="text-sm font-medium">{user?.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={() => setTwoFactorStep('idle')} className="p-3 rounded-xl bg-gray-800 font-bold">Cancelar</button>
                      <button 
                        onClick={handleRequestDisable2FA} 
                        disabled={isSubmitting}
                        className="p-3 rounded-xl bg-red-600 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Enviar Código"}
                      </button>
                    </div>
                  </div>
              ) : (
                  <div className="flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                      <Mail size={32} className="text-blue-500 mx-auto mb-2" />
                      <h3 className="font-bold text-lg text-white">Verifique seu e-mail</h3>
                      <p className="text-gray-400 text-sm px-4">
                        Insira o código de 6 dígitos que enviamos para seu e-mail para confirmar a desativação do 2FA.
                      </p>
                    </div>
                    <input
                        type="text"
                        maxLength={6}
                        placeholder="000000"
                        className="w-full bg-gray-950 border border-gray-800 p-4 rounded-xl text-center text-2xl tracking-[0.5em] focus:ring-2 focus:ring-blue-500 outline-none"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    />
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <button onClick={() => setTwoFactorStep('disable-request')} className="p-3 rounded-xl bg-gray-800 font-bold">Voltar</button>
                      <button 
                        onClick={handleConfirmDisable2FA} 
                        disabled={isSubmitting || otpCode.length !== 6}
                        className="p-3 rounded-xl bg-red-600 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                         {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "Confirmar"}
                      </button>
                    </div>
                  </div>
              )}
            </Dialog.Panel>
          </div>
        </Dialog>

        <main className="flex-1 overflow-auto relative lg:pt-0 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
  );
};

export default Layout;