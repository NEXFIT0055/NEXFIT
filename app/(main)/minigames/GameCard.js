'use client';
import { useRouter } from 'next/navigation';

export default function GameCard({ title, path }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(path)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow hover:shadow-lg transition"
    >
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500">點擊開始遊戲</p>
    </div>
  );
}
