import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <Video className="h-5 w-5 text-white" />
          </div>
          <span>Intell<span className="text-indigo-400">Meet</span></span>
        </Link>
        <h2 className="mt-6 text-3xl font-extrabold text-white">Reset password</h2>
        <p className="mt-2 text-sm text-slate-400">Enter your email to receive password reset instructions.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instructions Sent</h3>
              <p className="text-xs text-slate-400">
                If an account exists for {email}, password reset link has been dispatched.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline pt-2">
                <ArrowLeft className="h-4 w-4" /> Back to Log in
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@company.com"
                  className="mt-2 block w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Log in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
