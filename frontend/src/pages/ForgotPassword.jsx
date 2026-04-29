import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, Send } from 'lucide-react';
import { forgotPassword } from '../api';
import { toast } from 'sonner';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await forgotPassword(email);
            setSubmitted(true);
            toast.success("Se o e-mail estiver cadastrado, você receberá um link de recuperação.");
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
                        <Mail className="text-blue-500" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Recuperar Senha</h2>
                        <p className="text-gray-400 text-sm">Insira seu e-mail para receber as instruções.</p>
                    </div>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">E-mail</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className={normalInputStyle}
                                    placeholder="seu.email@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
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
                                        Enviar Instruções
                                        <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-4">
                        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <p className="text-blue-200 text-sm leading-relaxed">
                                Enviamos as instruções de recuperação para <strong>{email}</strong>. 
                                Verifique sua caixa de entrada e spam.
                            </p>
                        </div>
                        <button 
                            onClick={() => setSubmitted(false)}
                            className="text-gray-400 hover:text-white text-sm font-bold transition-colors"
                        >
                            Tentar outro e-mail
                        </button>
                    </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-800/50 text-center">
                    <Link to="/auth/login" className="text-gray-400 hover:text-white flex items-center justify-center gap-2 font-bold transition-colors">
                        <ArrowLeft size={16} /> Voltar para o Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
