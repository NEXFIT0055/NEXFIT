'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const events = [
  { date: "2025/04/01", text: "註冊帳號" },
  { date: "2025/04/03", text: "登入並開始計步" },
  { date: "2025/04/05", text: "第一次運動打卡，走了 5,000 步" },
  { date: "2025/04/07", text: "邀請朋友加入平台" },
  { date: "2025/04/10", text: "開始飲食記錄" },
  { date: "2025/04/15", text: "首次達標 10,000 步" },
  { date: "2025/04/20", text: "連續七天保持運動習慣" },
  { date: "2025/04/25", text: "參與小遊戲訓練反應力" },
];

const labels = [
  "2025/04/01", "2025/04/02", "2025/04/03", "2025/04/04", "2025/04/05", "2025/04/06",
  "2025/04/07", "2025/04/08", "2025/04/09", "2025/04/10", "2025/04/11", "2025/04/12",
  "2025/04/13", "2025/04/14", "2025/04/15", "2025/04/16", "2025/04/17", "2025/04/18",
  "2025/04/19", "2025/04/20", "2025/04/21", "2025/04/22", "2025/04/23", "2025/04/24",
  "2025/04/25"
];

const fakeSteps = [
  0, 500, 1500, 2500, 5000, 3000, 7000, 6500, 8000, 10000, 7500,
  6000, 8500, 9000, 10000, 9500, 8700, 9100, 9300, 12000, 11000,
  11500, 9000, 9800, 10500,
];

const data = {
  labels,
  datasets: [
    {
      label: '每日步數',
      data: fakeSteps,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.4,
      pointRadius: 4,
      fill: true,
    },
  ],
};

const options = {
  responsive: true,
  plugins: {
    legend: { display: true, position: 'top' },
  },
  scales: {
    x: { title: { display: true, text: '日期' } },
    y: {
      title: { display: true, text: '步數' },
      beginAtZero: true,
      suggestedMax: 15000,
    },
  },
};

export default function HealthChart() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
      <h2 className="font-semibold mb-2">個人健康歷程</h2>
      <Line data={data} options={options} />

      <div className="mt-6">
        <h3 className="font-semibold mb-2">歷程記錄</h3>
        <ul className="space-y-3">
          {events.map((e, idx) => (
            <li
              key={idx}
              className="border-l-4 border-blue-400 pl-3 relative"
            >
              <div className="text-xs text-gray-500">{e.date}</div>
              <div className="text-base font-medium">{e.text}</div>
              <div className="absolute left-[-0.6rem] top-1 w-3 h-3 bg-blue-400 rounded-full shadow-sm" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
