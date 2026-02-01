import { useDashboardStats, useRawMaterialPurchases, useFactoryCosts } from "@/hooks/use-manufacturing";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { 
  PackageSearch, 
  ScrollText,
  Droplet,
  Scissors, 
  Shirt, 
  Package,
  Box,
  ShoppingCart,
  DollarSign
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();
  const { data: materialPurchases = [] } = useRawMaterialPurchases();
  const { data: factoryCosts = [] } = useFactoryCosts();

  const totalMaterialSpent = materialPurchases.reduce((sum, p: any) => sum + p.totalCost, 0);
  const totalFactoryCosts = factoryCosts.reduce((sum, c: any) => sum + c.amount, 0);
  const unpaidBills = factoryCosts.filter((c: any) => c.status === 'unpaid').reduce((sum, c: any) => sum + c.amount, 0);

  const chartData = stats ? [
    { name: 'Yarn (Kg)', value: stats.totalYarnKg, color: '#3b82f6' },
    { name: 'Fabric (Kg)', value: stats.totalFabricKg, color: '#8b5cf6' },
    { name: 'Dyed (Kg)', value: stats.totalDyedKg, color: '#06b6d4' },
    { name: 'Cut (Pcs)', value: stats.totalCutPieces, color: '#ec4899' },
    { name: 'Stitched (Pcs)', value: stats.totalStitchedPieces, color: '#10b981' },
    { name: 'Packed (Pcs)', value: stats.totalPackedPieces, color: '#f59e0b' },
    { name: 'Bales Shipped', value: stats.totalBalesShipped, color: '#6366f1' },
  ] : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex min-h-screen bg-background font-body text-foreground">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 overflow-y-auto">
        <Header title="Production Dashboard" />
        
        <div className="p-8 w-full max-w-7xl mx-auto space-y-8 flex flex-col items-center">
          <div className="w-full">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-muted/50 rounded-xl" />)}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6"
            >
              <motion.div variants={item}>
                <StatsCard 
                  title="Total Yarn In" 
                  value={`${(stats?.totalYarnKg ?? 0).toLocaleString()} kg`} 
                  icon={PackageSearch} 
                  trend="+12%" 
                  trendUp={true}
                  className="border-l-4 border-l-blue-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Fabric Knitted" 
                  value={`${(stats?.totalFabricKg ?? 0).toLocaleString()} kg`} 
                  icon={ScrollText}
                  className="border-l-4 border-l-violet-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Fabric Dyed" 
                  value={`${(stats?.totalDyedKg ?? 0).toLocaleString()} kg`} 
                  icon={Droplet}
                  className="border-l-4 border-l-cyan-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Pieces Cut" 
                  value={(stats?.totalCutPieces ?? 0).toLocaleString()} 
                  icon={Scissors}
                  className="border-l-4 border-l-pink-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Garments Stitched" 
                  value={(stats?.totalStitchedPieces ?? 0).toLocaleString()} 
                  icon={Shirt}
                  className="border-l-4 border-l-emerald-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Boxes Packed" 
                  value={(stats?.totalPackedPieces ?? 0).toLocaleString()} 
                  icon={Package}
                  className="border-l-4 border-l-amber-500"
                />
              </motion.div>
              <motion.div variants={item}>
                <StatsCard 
                  title="Bales Shipped" 
                  value={(stats?.totalBalesShipped ?? 0).toLocaleString()} 
                  icon={Box}
                  className="border-l-4 border-l-indigo-500"
                />
              </motion.div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6 shadow-sm">
              <h3 className="text-lg font-bold font-display mb-6">Production Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold font-display mb-4">Quick Actions</h3>
              <div className="space-y-4 flex-1">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <PackageSearch className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900">Low Stock Alert</h4>
                    <p className="text-xs text-blue-700">Yarn Batch YRN-004 is running low</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">Cutting Delay</h4>
                    <p className="text-xs text-amber-700">Line 3 is behind schedule</p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-emerald-900">Shipment Ready</h4>
                    <p className="text-xs text-emerald-700">Order #8823 is ready for pickup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Material Purchases & Factory Costs */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Raw Material Purchases */}
            <motion.div variants={item} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold font-display">Raw Material Purchases</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">Rs. {totalMaterialSpent.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-blue-700 mt-2">{materialPurchases.length} purchases</p>
                </div>
                {materialPurchases.slice(0, 3).map((purchase: any) => (
                  <div key={purchase.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{purchase.materialType}</p>
                        <p className="text-xs text-muted-foreground">{purchase.vendor}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${purchase.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {purchase.paymentStatus}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-2">Rs. {purchase.totalCost.toLocaleString('en-PK', { maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Factory Costs & Bills */}
            <motion.div variants={item} className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold font-display">Factory Running Costs</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-amber-50 border border-amber-100">
                    <p className="text-xs text-amber-600 font-medium">Total Costs</p>
                    <p className="text-xl font-bold text-amber-900 mt-2">Rs. {totalFactoryCosts.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-xs text-red-600 font-medium">Unpaid Bills</p>
                    <p className="text-xl font-bold text-red-900 mt-2">Rs. {unpaidBills.toLocaleString('en-PK', { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                {factoryCosts.slice(0, 3).map((cost: any) => (
                  <div key={cost.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{cost.category}</p>
                        <p className="text-xs text-muted-foreground">{cost.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${cost.status === 'paid' ? 'bg-green-100 text-green-700' : cost.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {cost.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-2">Rs. {cost.amount.toLocaleString('en-PK', { maximumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
