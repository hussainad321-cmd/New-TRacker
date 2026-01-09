import { useDashboardStats } from "@/hooks/use-manufacturing";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { StatsCard } from "@/components/StatsCard";
import { 
  PackageSearch, 
  ScrollText, 
  Scissors, 
  Shirt, 
  Package 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  const chartData = stats ? [
    { name: 'Yarn (Kg)', value: stats.totalYarnKg, color: '#3b82f6' },
    { name: 'Fabric (Kg)', value: stats.totalFabricKg, color: '#8b5cf6' },
    { name: 'Cut (Pcs)', value: stats.totalCutPieces, color: '#ec4899' },
    { name: 'Stitched (Pcs)', value: stats.totalStitchedPieces, color: '#10b981' },
    { name: 'Packed (Pcs)', value: stats.totalPackedPieces, color: '#f59e0b' },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted/50 rounded-xl" />)}
            </div>
          ) : (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
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
          </div>
        </div>
      </main>
    </div>
  );
}
