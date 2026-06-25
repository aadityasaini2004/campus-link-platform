import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Mail, Lock, User, Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  
  // UI States
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [registerStep, setRegisterStep] = useState(1); // Step 1: Email, Step 2: OTP & Password
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' }); // type: 'error' or 'success'

  // Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // --- 1. SEND OTP FOR REGISTRATION ---
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/send-otp', { email: formData.email });
      showMessage('success', data.message);
      setRegisterStep(2); // Move to OTP and Password entry
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFY OTP & REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      // Save Token & Route
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      routeUser(data.role);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/auth/login', { 
        email: formData.email, 
        password: formData.password 
      });
      
      // Save Token & Route
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('userName', data.name);
      
      routeUser(data.role);
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Navigation Logic based on Role
  const routeUser = (role) => {
    if (role === 'AO') {
      navigate('/ao-dashboard');
    } else if (role === 'DepartmentStaff') {
      // 🔥 NEW: Route added for Department Staff
      navigate('/staff-dashboard');
    } else if (role === 'Faculty') {
      navigate('/faculty-dashboard');
    } else {
      // Default to Student Dashboard
      navigate('/student-dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-200">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
        
        {/* Header Logo */}
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <Building2 size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-wide">Campus Link</h1>
        <p className="text-center text-slate-400 mb-6">Centralized Issue Management</p>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 rounded-lg p-1 mb-6 border border-slate-700">
          <button 
            onClick={() => { setIsLoginMode(true); setRegisterStep(1); setMessage({type:'', text:''}); }}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${isLoginMode ? 'bg-slate-700 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLoginMode(false); setMessage({type:'', text:''}); }}
            className={`flex-1 py-2 rounded-md font-medium transition-all ${!isLoginMode ? 'bg-slate-700 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Status Messages */}
        {message.text && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm text-left border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'}`}>
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <p>{message.text}</p>
          </div>
        )}

        {/* ================= LOGIN FORM ================= */}
        {isLoginMode ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email Address"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

        ) : (
          /* ================= REGISTER FORM ================= */
          <div className="space-y-4">
            
            {/* Step 1: Send OTP */}
            {registerStep === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Full Name"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="University Email (@krmu.edu.in)"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                  {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              
            /* Step 2: Verify OTP & Setup Password */
              <form onSubmit={handleRegister} className="space-y-4">
                <p className="text-sm text-emerald-400 text-center mb-2">OTP sent to {formData.email}</p>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="text" name="otp" value={formData.otp} onChange={handleChange} required placeholder="Enter 6-digit OTP" maxLength="6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center text-xl tracking-widest transition-all placeholder:text-slate-500 placeholder:text-base placeholder:tracking-normal" />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                  <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Set New Password" minLength="6"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-500" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                  {loading ? 'Verifying & Registering...' : 'Verify OTP & Create Account'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;