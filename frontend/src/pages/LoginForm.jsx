import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserLock, Mail, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { login } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await login({ email, password });

            // Manter o token no localStorage
            const token = response.data.token;
            localStorage.setItem('@dumply:token', token);

            await refreshUser();
            navigate('/dashboard');
        } catch (err) {
            setError('E-mail ou senha incorretos. Tente novamente.');
            console.error("Erro no login:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 font-sans text-slate-200">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/20">
                        <UserLock className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">
                        DUMPLY<span className="text-blue-500">.</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Gestão de Equipamentos e Locações</p>
                </div>

                {/* Card do Login */}
                <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center text-sm animate-pulse">
                                <AlertCircle size={18} className="mr-3 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">E-mail</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="admin@dumply.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">Senha</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-700 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <>
                                    Entrar no Sistema
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button className="text-slate-500 text-sm hover:text-blue-400 transition-colors">
                            Esqueceu as suas credenciais? Contacte o suporte.
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} Dumply. Manager System. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;