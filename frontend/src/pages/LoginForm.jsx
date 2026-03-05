import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {Lock, Mail, Loader2, ArrowRight, UserLock} from 'lucide-react';
import { login } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'sonner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await login({ email, password });
            const token = response.data.token;
            localStorage.setItem('@dumply:token', token);

            await refreshUser();
            toast.success("Bem-vindo de volta ao Dumply!");
            navigate('/dashboard');
        } catch (err) {
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full bg-gray-900 border border-gray-800 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all group-hover:border-gray-700";

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Efeito de Glow de Fundo - Diferente do Registro */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Area do Logo - Simplificada e Centralizada */}
            <div className="relative z-10 mb-10 text-center">
                <h1 className="text-5xl font-black text-white tracking-tighter">
                    DUMPLY<span className="text-blue-500">.</span>
                </h1>
                <p className="text-gray-500 font-medium mt-2">Teste Fechado</p>
            </div>

            {/* CARD DE LOGIN CENTRALIZADO */}
            <div className="w-full max-w-md bg-gray-900/40 backdrop-blur-xl p-10 rounded-3xl border border-gray-800 shadow-2xl relative z-10">

                <div className="mb-8 flex items-center gap-4">
                    <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">
                        <UserLock className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Acessar Conta</h2>
                        <p className="text-gray-500 text-sm">Insira suas credenciais abaixo.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* E-mail */}
                    <div className="group relative">
                        <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">E-mail</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="email"
                                required
                                className={inputStyle}
                                placeholder="seu.email@empresa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Senha */}
                    <div className="group relative">
                        <div className="flex justify-between items-center mb-2 ml-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">Senha</label>
                            <Link to="/forgot-password" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest hover:text-blue-500 transition-colors">
                                Esqueceu?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="password"
                                required
                                className={inputStyle}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                    Entrar no Painel
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Registro */}
                <div className="mt-10 pt-8 border-t border-gray-800/50 text-center">
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                        Não tem conta?
                        <Link
                            to="/auth/register"
                            className="text-white hover:text-blue-400 font-bold transition-colors underline-offset-4 hover:underline"
                        >
                            Solicitar acesso Beta
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-12 text-[10px] text-gray-700 text-center uppercase font-bold tracking-[0.2em] relative z-10">
                &copy; 2026 Dumply. Todos os direitos reservados.
            </p>
        </div>
    );
};

export default Login;