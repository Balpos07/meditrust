import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Lock, Database, ArrowRight, Zap, CheckCircle2, Fingerprint, FileCheck, Stethoscope } from 'lucide-react';

export default function Landing() {
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10 text-primary" aria-hidden="true" />,
      title: 'Blockchain Verified Integrity',
      description: 'Every medical receipt and record is cryptographically signed and verifiable, ensuring absolute data integrity. Trust is baked into the protocol, preventing tampering at every level.',
      className: 'lg:col-span-2 md:col-span-2',
      large: true,
      gradient: 'from-primary/10 to-transparent'
    },
    {
      icon: <Lock className="w-8 h-8 text-success" aria-hidden="true" />,
      title: 'Role-Based Security',
      description: 'Granular access controls ensure that sensitive patient data is only accessible to authorized medical personnel.',
      className: 'lg:col-span-1 md:col-span-1',
      large: false,
      gradient: 'from-success/10 to-transparent'
    },
    {
      icon: <Database className="w-8 h-8 text-sky-500" aria-hidden="true" />,
      title: 'Immutable Ledger',
      description: 'Historical records cannot be altered or deleted, providing a complete, trustworthy audit trail.',
      className: 'lg:col-span-1 md:col-span-1',
      large: false,
      gradient: 'from-sky-500/10 to-transparent'
    },
    {
      icon: <Zap className="w-10 h-10 text-amber-500" aria-hidden="true" />,
      title: 'Instant Public Verification',
      description: 'Patients and auditors can verify receipt authenticity instantly using our public verification scanner, bypassing traditional slow administrative procedures and overhead.',
      className: 'lg:col-span-2 md:col-span-2',
      large: true,
      gradient: 'from-amber-500/10 to-transparent'
    }
  ];

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Hero Section */}
      <section className="relative flex-grow flex items-center justify-center px-4 sm:px-6 py-20 lg:py-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl opacity-50 pointer-events-none animate-breathe"></div>
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-sky-400/10 dark:bg-sky-400/20 rounded-full blur-3xl opacity-60 pointer-events-none animate-float"></div>

        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 mx-auto grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Hero Content (Left) */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary border border-primary/20 backdrop-blur-md animate-in slide-in-from-bottom-4 fade-in duration-700">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping"></span>
              <span className="text-sm font-semibold tracking-wide uppercase">The Future of Medical Records</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150">
              Trust & Transparency in <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">Healthcare</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300">
              MediTrust leverages advanced cryptographic verification to ensure medical receipts and patient records are immutable, secure, and easily verifiable by anyone.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full lg:w-auto animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500">
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

            <div className="mt-4 flex flex-col sm:flex-row items-center lg:items-start gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 font-medium animate-in fade-in duration-700 delay-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" /> HIPAA Compliant Architecture
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" /> Zero-Trust Security
              </div>
            </div>
          </div>

          {/* Hero Visual Element (Right) */}
          <div className="relative w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 flex justify-center lg:justify-end animate-in fade-in zoom-in duration-1000 delay-300">
            {/* Main Glass Card */}
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-6 flex flex-col gap-6 animate-float overflow-hidden">
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/40 dark:via-white/5 to-white/0 -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
              
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-bold flex items-center gap-1 border border-success/30">
                  <CheckCircle2 className="w-3 h-3" /> VERIFIED
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>

              <div className="flex-grow flex items-center justify-center py-4">
                 <div className="w-32 h-32 rounded-full border-[8px] border-dashed border-primary/30 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-20 h-20 bg-primary/20 rounded-full blur-md"></div>
                 </div>
                 {/* Fingerprint icon over the spinner */}
                 <Fingerprint className="absolute w-12 h-12 text-primary" />
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Tx Hash</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">0x7f4...a9c</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Timestamp</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">Just now</span>
                </div>
              </div>
            </div>

            {/* Decorative Floating Elements */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-4 animate-[float_4s_ease-in-out_infinite_reverse]">
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                 <FileCheck className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Record Secured</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Immutable Ledger</p>
              </div>
            </div>
            
            <div className="absolute top-10 -right-8 bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 animate-[float_5s_ease-in-out_infinite]">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                 <Lock className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Guarantees Banner */}
      <div className="w-full bg-white dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800/80 py-8 overflow-hidden relative">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase mb-6">
            Built with uncompromising security standards
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 transition-all duration-500">
            <div className="flex items-center gap-2 font-bold text-lg text-slate-700 dark:text-slate-300"><Lock className="w-5 h-5 text-slate-500" /> End-to-End Encryption</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-700 dark:text-slate-300"><ShieldCheck className="w-5 h-5 text-slate-500" /> Zero-Trust Architecture</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-700 dark:text-slate-300"><Fingerprint className="w-5 h-5 text-slate-500" /> Cryptographic Proofs</div>
            <div className="flex items-center gap-2 font-bold text-lg text-slate-700 dark:text-slate-300"><Database className="w-5 h-5 text-slate-500" /> Immutable Storage</div>
          </div>
        </div>
      </div>

      {/* Features Section - Premium Bento Grid */}
      <section className="relative z-10 bg-white dark:bg-slate-950 py-24 sm:py-32 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-primary/5 dark:bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">
              Uncompromising <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-300 dark:to-white">Security & Trust</span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400">
              We provide a foundational layer of trust for medical institutions, bridging the gap between healthcare providers, patients, and insurers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full mx-auto">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className={`group relative bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${feature.className}`}
              >
                {/* Hover Gradient Glow */}
                <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                
                <div className={`relative z-10 flex ${feature.large ? 'flex-col sm:flex-row items-start sm:items-center gap-8' : 'flex-col gap-6'} h-full`}>
                  <div className={`shrink-0 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm ${feature.large ? 'w-20 h-20' : 'w-16 h-16'}`}>
                    {feature.icon}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className={`font-bold text-slate-900 dark:text-white mb-3 ${feature.large ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>{feature.title}</h3>
                    <p className={`text-slate-600 dark:text-slate-400 leading-relaxed ${feature.large ? 'text-base sm:text-lg' : 'text-sm'}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative overflow-hidden bg-primary py-20 px-4 sm:px-6">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-sky-500/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/4"></div>
        </div>
        
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">Ready to secure your medical data?</h2>
          <p className="text-primary-50 text-lg sm:text-xl mb-10 max-w-2xl mx-auto text-sky-100">
            Join the network of forward-thinking healthcare providers ensuring absolute trust and data integrity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to="/login" 
              className="px-8 py-4 rounded-xl bg-white text-primary hover:bg-slate-50 font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none"
            >
              Get Started Now <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-2xl">
            <Activity className="text-primary w-8 h-8" aria-hidden="true" />
            <span>MediTrust</span>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm">
            © {new Date().getFullYear()} MediTrust. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
