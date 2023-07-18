import dayjs from 'dayjs';

// 计算 n 分钟前
export const getMinuteAgo = (n) => {
  return dayjs().subtract(n, 'minute').format('YYYY-MM-DD HH:mm:ss');
};

// 计算 n 分钟后
export const getMinuteAfter = (n) => {
  return dayjs().add(n, 'minute').format('YYYY-MM-DD HH:mm:ss');
}
