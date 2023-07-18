import { ref } from 'vue';
import dayjs from 'dayjs';

import { getMinuteAgo } from '@/utils/common';
import { formatPrice, formatPercent } from '@/utils/format';
import { useStorageSync } from '@/hooks/storage';
import { PLAY_UP_RISING_VOLUME, PAUSE_INTERVAL } from '@/constants';

// 重点关注
const importantData = useStorageSync('important-data', {});

// 历史记录
const history = useStorageSync('history-data', {});

// 收藏的列表
const favorites = useStorageSync('okx-favorite', []);

// 着重关注
export const useImportantData = () => {
  // 设置重要数据
  const setImportantData = (key, data) => {
    const old = importantData.value?.[key];

    // item 如果是 时间字符串，则表示这个时间之前不再激活
    if (typeof old === 'string') {
      if (dayjs().isBefore(old)) return;
    }

    importantData.value[key] = data;
  };

  // 删除重要数据
  const removeImportantData = (key) => {
    delete importantData.value[key];
  };

  const hasImportantData = (key) => {
    return importantData.value?.[key] === true;
  };

  return {
    importantData,
    setImportantData,
    hasImportantData,
    removeImportantData
  };
};

// 历史记录
export const useHistoryData = () => {
  // 获取指定时间的数据，默认一分钟
  const getHistoryByTime = (time = getMinuteAgo(1)) => {
    return history.value[time];
  };

  // 清除指定时间之前的数据
  const clearHistoryBeforeTime = (time = getMinuteAgo(PAUSE_INTERVAL)) => {
    Object.keys(history.value).forEach((key) => {
      if (key < time) {
        delete history.value[key];
      }
    });
  };

  // 设置指定时间的数据，默认当前时间
  const setHistoryByTime = (list, time = dayjs().format('YYYY-MM-DD HH:mm:ss')) => {
    clearHistoryBeforeTime();

    const obj = {};
    list.forEach((_item, index) => {
      obj[_item.name] = {
        changePer: _item.changePer,
        ranking: index
      };
    });

    history.value[time] = obj;
  };

  return {
    history,
    getHistoryByTime,
    clearHistoryBeforeTime,
    setHistoryByTime
  };
};

// 列表
export const useList = () => {
  const { getHistoryByTime } = useHistoryData();
  const { setImportantData } = useImportantData();

  const list = ref([]);

  const setList = (data) => {
    // 前一分钟的数据
    const minuteAgoData = getHistoryByTime();

    list.value = data.map((item) => {
      const name = item.instId.split('-')[0];

      if (minuteAgoData) {
        // 前一分钟的涨幅
        const oneMinuteAgoChangePer = minuteAgoData?.[name]?.changePer;

        if (oneMinuteAgoChangePer) {
          // 计算规则为一分钟之内上涨 N 以上
          setImportantData(name, item.changePer - oneMinuteAgoChangePer > PLAY_UP_RISING_VOLUME);
        }
      }

      const result = {
        ...item,
        name,

        // 涨幅变化显示的文字
        changePerText: formatPercent(item.changePer),

        // Logo 地址
        logo: `https://static.okx.com/cdn/oksupport/asset/currency/icon/${name.toLowerCase()}.png`,

        old: minuteAgoData?.[name],

        // 24小时成交量显示的文字
        volume24hText: formatPrice(item.volume24h),

        // 24小时成交额显示的文字
        turnOver24hText: formatPrice(item.turnOver24h),
      };

      return result;
    });
  };

  return {
    list,
    setList
  };
};

export const useFavorite = () => {
  // 是否已收藏
  const hasFavorite = (name) => {
    return favorites.value?.includes(name);
  };

  // 收藏按钮点击
  const addToFavorites = (item) => {
    if (favorites.value.includes(item.name)) {
      favorites.value = favorites.value.filter((fav) => fav !== item.name);
    } else {
      favorites.value = [...favorites.value, item.name];
    }
  };

  return {
    favorites,
    addToFavorites,
    hasFavorite
  };
};
