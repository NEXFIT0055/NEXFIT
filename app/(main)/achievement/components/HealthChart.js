import { Line } from "react-chartjs-2";

export default function HealthChart() {
  const data = {
    labels: ["2025/04/01", "2025/04/05", "2025/04/15"],
    datasets: [
      {
        label: "步數",
        data: [0, 5000, 10000],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "日期",
        },
      },
      y: {
        title: {
          display: true,
          text: "步數",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-green-200 p-4 rounded-xl">
      <h2 className="font-semibold mb-2">個人健康歷程</h2>
      <Line data={data} options={options} />
    </div>
  );
}