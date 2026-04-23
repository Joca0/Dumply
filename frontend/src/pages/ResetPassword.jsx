import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Loader2, ArrowLeft, Key, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '../api';
import { toast } from 'sonner';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(searchParams.get('token') || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem.");
            return;
        }

        if (newPassword.length < 8) {
            toast.error("A senha deve ter pelo menos 8 caracteres.");
            return;
        }

        setLoading(true);

        try {
            await resetPassword(token, newPassword);
            setSuccess(true);
            toast.success("Senha redefinida com sucesso!");
            setTimeout(() => navigate('/auth/login'), 3000);
        } catch (err) {
            // Erro já tratado pelo interceptor
        } finally {
            setLoading(false);
        }
    };

    const normalInputStyle = "w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:border-gray-700";

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 mb-10 text-center">
                <h1 className="text-5xl font-black text-white tracking-tighter">
                    DUMPLY<span className="text-blue-500">.</span>
                </h1>
            </div>

            <div className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl p-10 rounded-3xl border border-gray-800 shadow-2xl relative z-10">
                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                        <Key className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Nova Senha</h2>
                        <p className="text-gray-500 text-sm">Defina sua nova credencial de acesso.</p>
                    </div>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Token Field (Auto-filled if in URL) */}
                        <div className="group relative">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Token de Recuperação</label>
                            <div className="relative">
                                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className={normalInputStyle}
                                    placeholder="Cole o token recebido"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="group relative">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Nova Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={normalInputStyle}
                                    placeholder="No mínimo 8 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="group relative">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Confirmar Senha</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className={normalInputStyle}
                                    placeholder="Repita a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Redefinir Senha
                                        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Tudo pronto!</h3>
                        <p className="text-gray-400 text-sm mb-8">Sua senha foi redefinida com sucesso. Redirecionando para o login...</p>
                        <Link to="/auth/login" className="text-blue-500 hover:text-blue-400 font-bold transition-colors underline underline-offset-4">
                            Ir para o login agora
                        </Link>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
                    <Link to="/auth/login" className="text-gray-500 hover:text-white flex items-center justify-center gap-2 font-bold transition-colors">
                        <ArrowLeft size={16} /> Cancelar e Voltar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
