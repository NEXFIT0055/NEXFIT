export default function Leaderboard({ users }) {
  // 排序用戶數據，根據積分從高到低
  const sortedUsers = [...users].sort((a, b) => b.score - a.score);

  // 檢查數據結構是否正確
  console.log("Leaderboard users:", sortedUsers); // 測試用

  return (
    <div className="bg-cyan-200 p-4 rounded-xl">
      <h2 className="font-semibold mb-2">排行榜</h2>
      <ul className="space-y-2">
        {sortedUsers.map((u, idx) => {
          // 防禦性檢查
          if (typeof u !== 'object' || !u.name || typeof u.score !== 'number') {
            console.error("Invalid user data:", u); // 測試用
            return null;
          }

          return (
            <li
              key={idx}
              className="bg-white p-3 rounded-lg shadow flex justify-between items-center border"
            >
              <span>{u.name}</span>
              <span className="font-bold">{u.score} 分</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}