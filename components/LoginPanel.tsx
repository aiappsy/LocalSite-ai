'use client';

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LoginPanel: React.FC = () => {
  const { loginWithGoogle, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    
    // Check for Secure Context (HTTPS requirement for Firebase Auth)
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      const msg = "Google Login requires a secure connection (HTTPS). Please access the site via https://";
      setError(msg);
      return;
    }

    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Login component error:", err);
      const technicalMsg = err.code ? `Auth Error (${err.code}): ${err.message}` : err.message;
      setError(technicalMsg || "Failed to initiate login. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-md bg-slate-900/50 border-slate-800 backdrop-blur-xl shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
              <Sparkles className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-white mb-2">
            Aiappsy WebCrafter
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Sign in to access your AI-powered workspace and sync your projects to the cloud.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 py-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <Zap className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-200">Cloud Sync & Backup</p>
                <p className="text-[10px] text-slate-500">Your sites and prompts are saved automatically.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-200">Secure AI Environment</p>
                <p className="text-[10px] text-slate-500">Enterprise-grade security using Firebase Auth.</p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full h-12 bg-white hover:bg-slate-100 text-slate-950 font-bold flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-slate-600 px-8">
            By signing in, you agree to our Terms of Service and Privacy Policy. All your data is stored securely in your private cloud workspace.
          </p>
        </CardContent>
      </Card>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 text-slate-700 text-xs font-medium tracking-widest uppercase">
        Aiappsy © 2026 • Advanced Agentic Coding
      </div>
    </div>
  );
};
