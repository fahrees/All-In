import { Shield, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/20 rounded-full blur-[128px] mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-accent/20 rounded-full blur-[128px] mix-blend-screen" />
      
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop')] opacity-[0.03] bg-cover bg-center mix-blend-overlay pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-3xl px-4 flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary/30 transform rotate-3">
          <Shield className="w-10 h-10 text-white transform -rotate-3" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white mb-6 tracking-tight leading-tight">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Wealth</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          The ultimate secure dashboard for visionary investors. Track traditional, digital, and private assets, enhanced by deep AI insights to optimize your financial resilience.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-16">
          <a 
            href="/api/login"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto"
          >
            <span className="relative flex items-center gap-2">
              Login to Access
              <TrendingUp className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full border-t border-white/10 pt-12">
          {[
            { icon: Shield, title: "Bank-grade Security", desc: "Your financial data is protected with enterprise encryption." },
            { icon: TrendingUp, title: "Unified Tracking", desc: "All your assets across markets in one elegant view." },
            { icon: Sparkles, title: "AI-Powered Insights", desc: "Identify opportunities and risks before the market does." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-white font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
