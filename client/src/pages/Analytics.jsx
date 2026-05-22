import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import RevenueChart from '../components/charts/RevenueChart';
import ProductChart from '../components/charts/ProductChart';
import api from '../services/api';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, revenueRes, productsRes] = await Promise.all([
          api.get('/dashboard/analytics'),
          api.get('/dashboard/revenue'),
          api.get('/dashboard/top-products'),
        ]);

        setStats(analyticsRes.data);
        setRevenueData(revenueRes.data);
        setTopProducts(
          productsRes.data.map((p, i) => ({ name: p.name, value: p.salesCount || i + 1 }))
        );
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalSales = stats?.totalSales || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const avgDailyRevenue = totalSales > 0 ? Math.round(totalRevenue / Math.max(1, revenueData.length)) : 0;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-white gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">Loading live analytics...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={revenueData} />
            <ProductChart data={topProducts} />
          </div>

          <div className="mt-8 backdrop-blur-md bg-white/10 border border-white/20 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Analytics Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400">Avg. Daily Revenue</p>
                <p className="text-2xl font-bold text-white">${avgDailyRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Orders (Sales)</p>
                <p className="text-2xl font-bold text-white">{totalSales}</p>
              </div>
              <div>
                <p className="text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default Analytics;
