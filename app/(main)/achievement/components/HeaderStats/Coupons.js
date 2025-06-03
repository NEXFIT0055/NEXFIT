export default function Coupons({ score, coupons }) {
  const handleCopy = (coupon) => {
    navigator.clipboard.writeText(coupon).then(() => {
      alert(`優惠券 ${coupon} 已複製到剪貼簿！`);
    }).catch(() => {
      alert('複製失敗，請手動複製！');
    });
  };

  return (
    <div className="bg-gray-300 p-4 h-64 rounded-xl text-center flex flex-col items-center justify-start text-gray-800 col-span-1">
      <h3 className="font-semibold mb-2 text-lg">我的優惠券</h3>
      <ul className="space-y-2 overflow-y-auto w-full max-h-40">
        {coupons.length > 0 ? (
          coupons.map((coupon, idx) => (
            <li
              key={idx}
              className="bg-white p-2 rounded-md shadow flex justify-between items-center"
            >
              <span className="text-sm font-medium">{coupon}</span>
              <button
                className="text-xs text-blue-500 hover:underline"
                onClick={() => handleCopy(coupon)}
              >
                複製
              </button>
            </li>
          ))
        ) : (
          <p className="text-gray-500">尚無優惠券</p>
        )}
      </ul>
      <div className="mt-4">
        <p className="text-sm font-medium">當前積分：<span className="text-pink-500 font-bold">{score}</span></p>
      </div>
      <a
        href="http://localhost:3000/accountCenter/mall/coupon" // 替換為實際商城連結
        target="_blank"
        rel="noopener noreferrer"
        className="text-lg font-bold text-green-600 hover:text-green-800 mt-4"
      >
        我現在就要買東西!!!!!(點我進入商城)
      </a>
    </div>
  );
}