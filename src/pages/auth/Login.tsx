import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { authService } from '../../lib/api';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email.split('@')[0], email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleGoogleSuccess = (credentialResponse: any) => {
      console.log('Google Login Success:', credentialResponse);
      // Here you would typically send the credentialResponse.credential to your backend
      // await authService.googleLogin(credentialResponse.credential);
      // For now, simulating success
      localStorage.setItem('user', JSON.stringify({ token: 'mock-google-token', role: 'user' }));
      navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden font-sans">
      {/* Cinematic Video Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 z-10" />
         <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover scale-110 opacity-60 filter blur-[2px]"
            src="https://cdn.pixabay.com/video/2023/10/15/185090-874636923_large.mp4"
         />
      </div>

      {/* Floating Particles/Elements (Simulated with div for now) */}
      <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-600 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-600 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-20 w-full max-w-md p-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(139,92,246,0.3)] relative group"
      >
        {/* Glow Border Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-1000 blur"></div>

        <div className="relative">
            <h2 className="text-4xl font-black mb-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tighter">
            ANIME<span className="text-purple-500">CREW</span>
            </h2>
            <p className="text-center text-gray-400 mb-8 text-sm uppercase tracking-widest">
                {isLogin ? 'Premium Access' : 'Begin Your Journey'}
            </p>

        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-purple-900/50"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </motion.button>
        </form>

        <div className="my-6 flex items-center justify-center">
            <div className="h-px w-full bg-zinc-700"></div>
            <span className="px-3 text-zinc-500 text-sm">OR</span>
            <div className="h-px w-full bg-zinc-700"></div>
        </div>

        <div className="flex justify-center mb-6">
            <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                theme="filled_black"
                shape="pill"
            />
        </div>

        <div className="mt-6 text-center text-zinc-400 text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 font-medium ml-1"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
