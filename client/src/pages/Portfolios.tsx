import { useState } from "react";
import { usePortfolios, useCreatePortfolio } from "@/hooks/use-portfolios";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, FolderOpen, ArrowRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function Portfolios() {
  const { data: portfolios, isLoading } = usePortfolios();
  const { user } = useAuth();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const createMutation = useCreatePortfolio();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortfolioName.trim() || !user) return;
    
    await createMutation.mutateAsync({
      name: newPortfolioName,
      userId: user.id
    });
    
    setIsCreateOpen(false);
    setNewPortfolioName("");
  };

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">My Portfolios</h1>
          <p className="text-muted-foreground">Manage and organize your distinct asset collections.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Create Portfolio
        </button>
      </div>

      {portfolios && portfolios.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map(portfolio => (
            <motion.div variants={itemVariants} key={portfolio.id}>
              <Link href={`/portfolios/${portfolio.id}`} className="block h-full">
                <div className="glass-panel p-6 rounded-2xl h-full border border-white/10 hover:border-primary/50 transition-all duration-300 group cursor-pointer hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{portfolio.name}</h3>
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <span className="text-sm text-muted-foreground">View details</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-panel rounded-3xl p-12 flex flex-col items-center justify-center text-center border-dashed border-2 border-white/10">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <FolderOpen className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No portfolios yet</h3>
          <p className="text-muted-foreground max-w-md mb-8">
            Create your first portfolio to start tracking your traditional, digital, and private assets in one secure place.
          </p>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5" />
            Create Your First Portfolio
          </button>
        </div>
      )}

      {/* Modal / Dialog strictly built without external dependencies to avoid missing components */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-white/10 shadow-2xl rounded-2xl p-6"
            >
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-display font-bold text-white mb-6">New Portfolio</h2>
              
              <form onSubmit={handleCreate}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Portfolio Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newPortfolioName}
                    onChange={e => setNewPortfolioName(e.target.value)}
                    placeholder="e.g. High Yield Dividend Fund"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending || !newPortfolioName.trim()}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Portfolio"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
