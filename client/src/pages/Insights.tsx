import { useInsights, useGenerateInsights } from "@/hooks/use-insights";
import { Sparkles, Lightbulb, PieChart, Activity, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Insights() {
  const { data: insights, isLoading } = useInsights();
  const generateMutation = useGenerateInsights();

  const handleGenerate = async () => {
    await generateMutation.mutateAsync(undefined);
  };

  const getCategoryConfig = (category: string) => {
    switch(category.toLowerCase()) {
      case 'diversification': return { icon: PieChart, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
      case 'liquidity': return { icon: Activity, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      case 'opportunity': return { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      default: return { icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' };
    }
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute left-0 top-0 w-full h-full bg-gradient-to-r from-primary/10 to-accent/10 pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" /> AI Financial Insights
          </h1>
          <p className="text-muted-foreground text-lg">Intelligent analysis of your wealth composition.</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generateMutation.isPending}
          className="relative z-10 flex items-center gap-2 bg-gradient-to-r from-accent to-primary text-white px-6 py-3.5 rounded-xl font-bold shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
        >
          {generateMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          {generateMutation.isPending ? "Analyzing Portfolio..." : "Run AI Analysis"}
        </button>
      </div>

      {insights && insights.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {insights.map(insight => {
            const { icon: Icon, color, bg } = getCategoryConfig(insight.category);
            return (
              <motion.div variants={itemVariants} key={insight.id} className="glass-panel p-6 md:p-8 rounded-2xl flex gap-6 hover:border-white/10 transition-colors">
                <div className={`shrink-0 w-14 h-14 rounded-2xl border ${bg} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white capitalize tracking-tight mb-3">
                    {insight.category} Insight
                  </h3>
                  <p className="text-muted-foreground text-base leading-relaxed">
                    {insight.content}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <div className="glass-panel p-16 rounded-3xl text-center flex flex-col items-center justify-center border-dashed border-2 border-white/10">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Lightbulb className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">No Insights Generated</h3>
          <p className="text-muted-foreground max-w-lg mb-8 text-lg">
            Our AI engine can analyze your portfolios for hidden opportunities, diversification risks, and liquidity metrics.
          </p>
          <button 
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="flex items-center gap-2 bg-white text-background px-8 py-4 rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1 hover:bg-white/90"
          >
            <Sparkles className="w-5 h-5" />
            Analyze My Portfolio Now
          </button>
        </div>
      )}
    </div>
  );
}
