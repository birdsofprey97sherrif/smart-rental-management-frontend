import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../utils/axiosInstance';

import { useToast } from '../context/ToastContext';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AdminCharts() {
  const [chartData, setChartData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const { data } = await axios.get('/admin/analytics/trends');
        setChartData(data);
      } catch (err) {
        showToast('Chart data failed to load', 'error');
      }
    };

    fetchChartData();
  }, [showToast]);

  if (!chartData) return <p>Loading chart data...</p>;

  const userGrowth = {
    labels: chartData.months,
    datasets: [
      {
        label: 'New Users',
        data: chartData.newUsers,
        fill: false,
        borderColor: 'green',
        tension: 0.3,
      },
      {
        label: 'Relocations',
        data: chartData.relocations,
        fill: false,
        borderColor: 'blue',
        tension: 0.3,
      },
      {
        label: 'Defaulters',
        data: chartData.defaulters,
        fill: false,
        borderColor: 'red',
        tension: 0.3,
      }
    ],
  };

  return (
    <div className="mt-5">
      <h4 className="mb-3 fw-semibold">📊 Activity Trends</h4>
      <Line data={userGrowth} />
    </div>
  );
}
