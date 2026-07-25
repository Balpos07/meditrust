import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Lock, Database, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" aria-hidden="true" />,
      title: 'Blockchain Verified',
      description: 'Every medical receipt and record is cryptographically signed and verifiable, ensuring absolute data integrity.'
    },
    {
      icon: <Lock className="w-8 h-8 text-success" aria-hidden="true" />,
      title: 'Role-Based Security',
      description: 'Granular access controls ensure that sensitive patient data is only accessible to authorized medical personnel.'
    },
    {
      icon: <Database className="w-8 h-8 text-sky-500" aria-hidden="true" />,
      title: 'Immutable Ledger',
      description: 'Historical records cannot be altered or deleted, providing a complete, trustworthy audit trail.'
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" aria-hidden="true" />,
      title: 'Instant Verification',
      description: 'Patients and auditors can verify receipt authenticity instantly using our public verification scanner.'
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-20 lg:py-32 overflow-hidden">
        {/* Background Gradients specific to Hero */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-breathe"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-float"></div>

        <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
            <span className="text-sm font-semibold tracking-wide uppercase">The Future of Medical Records</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Trust & Transparency in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">Healthcare</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            MediTrust leverages advanced cryptographic verification to ensure medical receipts and patient records are immutable, secure, and easily verifiable by anyone.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full justify-center">
            <Link 
              to="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary hover:bg-sky-500 text-white font-bold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] hover:-translate-y-1 flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              Access Dashboard <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            
            <Link 
              to="/verify" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-lg transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus-visible:ring-4 focus-visible:ring-primary/50 focus-visible:outline-none"
            >
              <ShieldCheck className="w-5 h-5 text-success" aria-hidden="true" /> Verify a Receipt
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" /> HIPAA Compliant Architecture
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" /> Zero-Trust Security
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">Why choose MediTrust?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We provide a foundational layer of trust for medical institutions, bridging the gap between healthcare providers, patients, and insurers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xl">
            <Activity className="text-primary w-6 h-6" aria-hidden="true" />
            <span>MediTrust</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} MediTrust. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
