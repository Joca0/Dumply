import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    User,
    Mail,
    Lock,
    ShieldCheck,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Building2,
    Key,
    Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';
import { useDocumentMask } from "@/hooks/useDocumentMask.jsx";
import { register } from "@/api/index.js";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        ownerDocuments: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: ''
    });

    const documentMask = useDocumentMask(
        formData.ownerDocuments,
        (value) => setFormData({...formData, ownerDocuments: value})
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return toast.error("As senhas não coincidem");
        }

        setLoading(true);
        try {
            await register({
                companyName: formData.companyName,
                ownerName: formData.fullName,
                ownerEmail: formData.email,
                ownerDocuments: formData.ownerDocuments,
                ownerPassword: formData.password
            });

            toast.success("Conta criada com sucesso! Você já pode fazer login.");
            navigate('/login');
        } catch (error) {
            const message = error.response?.data || "Erro ao realizar cadastro.";
            console.error("Erro no cadastro:", error);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full bg-gray-900/50 border border-gray-800 rounded-2xl p-4 pl-12 text-white placeholder:text-gray-600 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all group-hover:border-gray-700";

    return (
        <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row overflow-hidden">

            {/* PAINEL VISUAL (ESQUERDA) - Escondido no mobile */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-blue-600 items-center justify-center p-12 overflow-hidden">
                {/* Elementos Decorativos de Fundo */}
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-indigo-900"></div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 border-4 border-white rounded-full"></div>
                    <div className="absolute -bottom-12.5 -right-12.5 w-96 h-96 border-20 border-white/20 rounded-full"></div>
                </div>

                <div className="relative z-10 max-w-md text-center">
                    <div className="inline-flex p-4 bg-white/10 backdrop-blur-xl rounded-3xl mb-8 shadow-2xl border border-white/20">
                        <ShieldCheck size={48} className="text-white" />
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-6">
                        Você está acessando o teste fechado do Dumply.
                    </h1>
                    <p className="text-blue-100 text-lg font-medium leading-relaxed">
                        Estamos validando a plataforma com empresas selecionadas antes do lançamento oficial.
                    </p>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left">
                            <CheckCircle2 className="text-blue-300 mb-2" size={20} />
                            <p className="text-white text-xs font-bold uppercase tracking-widest">Segurança</p>
                            <p className="text-blue-200 text-xs">Criptografia de ponta a ponta.</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left">
                            <CheckCircle2 className="text-blue-300 mb-2" size={20} />
                            <p className="text-white text-xs font-bold uppercase tracking-widest">Escalabilidade</p>
                            <p className="text-blue-200 text-xs">Pronto para grandes frotas.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* PAINEL DE FORMULÁRIO (DIREITA) */}
            <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
                {/* Glow de fundo para mobile */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] lg:hidden"></div>

                <div className="w-full max-w-110 relative z-10">
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-black text-white tracking-tight mb-2">Cadastre sua empresa</h2>
                        <p className="text-gray-400 font-medium">O Dumply está em fase de validação privada com empresas estratégicas. Faça parte do início.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Campo Nome Completo */}
                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Nome Completo</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className={inputStyle}
                                    placeholder="Ex: João Silva"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Campo CPF/CNPJ */}
                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">CPF/CNPJ</label>
                            <div className="relative">
                                <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    required
                                    className={inputStyle}
                                    placeholder={documentMask.placeholder}
                                    value={formData.ownerDocuments}
                                    onChange={documentMask.handleChange}
                                    maxLength={documentMask.maxLength}
                                />
                            </div>
                        </div>

                        {/* Campo Empresa */}
                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Empresa</label>
                            <div className="relative">
                                <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    className={inputStyle}
                                    placeholder="Nome da sua empresa"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Campo E-mail */}
                        <div className="group relative">
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Seu E-mail para login</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    required
                                    className={inputStyle}
                                    placeholder="nome@empresa.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Grid de Senhas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group relative">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Senha</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className={inputStyle}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="group relative">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1 block tracking-widest group-focus-within:text-blue-500 transition-colors">Confirmar</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className={inputStyle}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-3 group"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Entrar no beta
                                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                        {/* BOTÃO DE "JÁ POSSUI CADASTRO" ADICIONADO AQUI */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-400 font-medium">
                                Já possui uma conta?{' '}
                                <Link
                                    to="/login"
                                    className="text-blue-500 hover:text-blue-400 font-bold transition-colors ml-1 underline-offset-4 hover:underline"
                                >
                                    Faça login agora
                                </Link>
                            </p>
                        </div>
                    </form>

                    <p className="mt-12 text-xs text-gray-700 text-center uppercase font-bold tracking-[0.2em]">
                        &copy; 2026 Dumply.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;