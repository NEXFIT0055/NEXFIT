import ProfileImage from '@/app/components/ProfileImage';
import UserInfo from './HeaderStats/UserInfo';
import Achievements from './HeaderStats/Achievements';

export default function HeaderStats({
  score = 0,
  level = 1,
  max = 5000,
  coupons = [],
  achievements = [],
}) {
  const validScore = typeof score === 'number' && !isNaN(score) ? score : 0;
  const validLevel = typeof level === 'number' && !isNaN(level) ? level : 1;

  // 僅傳遞已解鎖的成就
  const unlockedAchievements = achievements.filter(a => a.unlocked === true);

   return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-white rounded-xl shadow-sm text-sm">
      {/* 左半邊：Profile + UserInfo */}
      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-2 lg:space-y-0 lg:space-x-4">
        <ProfileImage />
        <UserInfo level={validLevel} />
      </div>

      {/* 右半邊：Achievements 徽章 */}
      <div className="flex justify-center lg:justify-end bg-yellow-50 p-2 rounded min-h-[70px]">
        <Achievements achievements={achievements} />
      </div>
    </div>
  );
}
