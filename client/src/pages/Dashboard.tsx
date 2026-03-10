import { useQuery, useQueries } from "@tanstack/react-query";
import { usePortfolios } from "@/hooks/use-portfolios";
import { api, buildUrl } from "@shared/routes";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Activity, PieChart as PieChartIcon } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: portfolios, isLoading: portfoliosLoading } = usePortfolios();

  // Fetch detailed portfolio data to get assets
  const portfolioQueries = useQueries({
    queries: (portfolios || []).map(p => ({
      queryKey: [api.portfolios.get.path, p.id],
      queryFn: async () => {
        const res = await fetch(buildUrl(api.portfolios.get.path, { id: p.id }), { credentials: 'include' });
        if (!res.ok) throw new Error("Failed");
        return api.portfolios.get.responses[200].parse(await res.json());
      },
      staleTime: 5 * 60 * 1000
    }))
  });

  const isLoading = portfoliosLoading || portfolioQueries.some(q => q.isLoading);
  const allAssets = portfolioQueries.flatMap(q => q.data?.assets || []);
  
  const totalWealth = allAssets.reduce((sum, a) => sum + (Number(a.quantity) * Number(a.currentValue)), 0);

  // Group assets for charting
  const allocationData = allAssets.reduce((acc, asset) => {
    const val = Number(asset.quantity) * Number(asset.currentValue);
    acc[asset.assetType] = (acc[asset.assetType] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(allocationData)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#0ea5e9', '#14b8a6', '#8b5cf6', '#f43f5e', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Here is the state of your global portfolio.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Net Worth</h3>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-white">{formatCurrency(totalWealth)}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Active Portfolios</h3>
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
              <PieChartIcon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-white">{portfolios?.length || 0}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Assets Tracked</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-4xl font-display font-bold text-white">{allAssets.length}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-xl font-display font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-primary" />
            Asset Allocation
          </h3>
          
          {chartData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '12px', color: 'white' }}
                    itemStyle={{ color: 'white' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-white/10 rounded-xl">
              <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
              <p>No assets to display. Create a portfolio first.</p>
              <Link href="/portfolios" className="mt-4 text-primary hover:underline">Manage Portfolios</Link>
            </div>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col">
          <h3 className="text-xl font-display font-bold text-white mb-6">Top Holdings</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {allAssets.length > 0 ? (
              allAssets
                .map(a => ({ ...a, totalValue: Number(a.quantity) * Number(a.currentValue) }))
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map(asset => (
                  <div key={asset.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <p className="font-bold text-white">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground capitalize">{asset.assetType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{formatCurrency(asset.totalValue)}</p>
                      <p className="text-xs text-muted-foreground">{asset.quantity} units</p>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-center text-muted-foreground mt-10">No holdings yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
