import { useState } from "react";
import { useParams, Link } from "wouter";
import { usePortfolio } from "@/hooks/use-portfolios";
import { useCreateAsset, useDeleteAsset } from "@/hooks/use-assets";
import { ArrowLeft, Plus, Trash2, TrendingUp, DollarSign, Hexagon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

export default function PortfolioDetail() {
  const params = useParams();
  const portfolioId = Number(params.id);
  const { data, isLoading } = usePortfolio(portfolioId);
  const deleteMutation = useDeleteAsset();
  const createMutation = useCreateAsset();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    assetType: "traditional",
    quantity: "",
    currentValue: ""
  });

  if (isLoading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
        <p className="text-muted-foreground mb-6">The portfolio you are looking for does not exist.</p>
        <Link href="/portfolios" className="text-primary hover:underline">Return to Portfolios</Link>
      </div>
    );
  }

  const { portfolio, assets } = data;
  const totalValue = assets.reduce((sum, a) => sum + (Number(a.quantity) * Number(a.currentValue)), 0);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      portfolioId: portfolio.id,
      symbol: formData.symbol,
      name: formData.name,
      assetType: formData.assetType,
      quantity: formData.quantity,
      currentValue: formData.currentValue,
      currency: "USD"
    });
    setIsAddOpen(false);
    setFormData({ symbol: "", name: "", assetType: "traditional", quantity: "", currentValue: "" });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this asset?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const assetTypeColors: Record<string, string> = {
    traditional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    digital: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    private: "bg-purple-500/10 text-purple-400 border-purple-500/20"
  };

  return (
    <div className="space-y-8 pb-12">
      <Link href="/portfolios" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors text-sm font-medium mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Portfolios
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 glass-panel p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 text-primary text-sm font-bold tracking-wider uppercase">
            <Hexagon className="w-4 h-4" /> Portfolio Overview
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-white tracking-tight">{portfolio.name}</h1>
        </div>
        
        <div className="relative z-10 text-left md:text-right">
          <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-widest">Total Value</p>
          <p className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <h2 className="text-2xl font-bold text-white">Assets</h2>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/5 text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-lg backdrop-blur-sm"
        >
          <Plus className="w-4 h-4" /> Add Asset
        </button>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Asset</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Quantity</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Total Value</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No assets recorded in this portfolio.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => {
                  const val = Number(asset.quantity) * Number(asset.currentValue);
                  const typeClass = assetTypeColors[asset.assetType] || assetTypeColors.traditional;
                  
                  return (
                    <tr key={asset.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-background border border-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                            {asset.symbol.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-white text-base">{asset.symbol}</p>
                            <p className="text-xs text-muted-foreground">{asset.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${typeClass} capitalize`}>
                          {asset.assetType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-white">
                        {asset.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium text-white">
                        {formatCurrency(asset.currentValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-primary">
                        {formatCurrency(val)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button 
                          onClick={() => handleDelete(asset.id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-flex"
                          title="Remove Asset"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Asset Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsAddOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8"
            >
              <button onClick={() => setIsAddOpen(false)} className="absolute top-6 right-6 text-muted-foreground hover:text-white">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-display font-bold text-white mb-6">Add New Asset</h2>
              
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Symbol / Ticker</label>
                    <input
                      required
                      placeholder="e.g. AAPL"
                      value={formData.symbol}
                      onChange={e => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Asset Type</label>
                    <select
                      value={formData.assetType}
                      onChange={e => setFormData({...formData, assetType: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors"
                    >
                      <option value="traditional">Traditional (Stocks/Bonds)</option>
                      <option value="digital">Digital (Crypto)</option>
                      <option value="private">Private (Real Estate/VC)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Asset Name</label>
                  <input
                    required
                    placeholder="e.g. Apple Inc."
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Quantity</label>
                    <input
                      required
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Current Price (USD)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <input
                        required
                        type="number"
                        step="any"
                        min="0"
                        placeholder="0.00"
                        value={formData.currentValue}
                        onChange={e => setFormData({...formData, currentValue: e.target.value})}
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-background border border-white/10 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-6 py-3 rounded-xl font-medium text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-6 py-3 rounded-xl font-semibold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {createMutation.isPending ? "Adding..." : "Add Asset"}
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
