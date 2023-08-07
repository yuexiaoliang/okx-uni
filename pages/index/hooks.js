import { ref, reactive, computed } from 'vue';
import dayjs from 'dayjs';

import ringtone from '@/static/audios/ringtone.mp3';

import { getMinuteAgo, getSecondAgo } from '@/utils/common';
import { formatPrice, formatPercent, formatFloat } from '@/utils/format';
import { useStorageSync } from '@/hooks/storage';
import { PLAY_UP_RISING_VOLUME, PAUSE_INTERVAL } from '@/constants';

// 重点关注
const importantData = useStorageSync('important-data', {});

// 历史记录
const history = useStorageSync('history-data', {});

// 收藏的列表
const favorites = useStorageSync('favorites-data', []);

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
  // 获取指定时间的数据，默认30秒前
  const getHistoryByTime = (time = getSecondAgo(30)) => {
    let result = history.value[time];

    // 如果没找到，则往前找
    if (!result) {
      const keys = Object.keys(history.value);
      for (let i = keys.length - 1; i >= 0; i--) {
        const key = keys[i];
        if (key < time) {
          result = history.value[key];
          break;
        }
      }
    }

    return result || {};
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
    list.forEach((_item) => {
      const { changePer1M, changePer1d, changePer1h, changePer1w, changePer5m } = _item;
      obj[_item.name] = {
        changePer1M,
        changePer1d,
        changePer1h,
        changePer1w,
        changePer5m
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
  const { setImportantData } = useImportantData();

  // 数据周期
  const periods = ref([
    { label: '5分钟', value: '5m' },
    { label: '1小时', value: '1h' },
    { label: '1天', value: '1d' },
    { label: '1周', value: '1w' },
    { label: '1月', value: '1M' }
  ]);

  // 5m-5分钟、1h-1小时、1d-1天、1w-1周、1M-1月
  const period = ref('1d');

  const _data = reactive({});

  const list = computed(() =>
    Object.values(_data)
      .filter((item) => item.changePer1d > 0.02)
      .sort((a, b) => b.changePer - a.changePer)
  );

  const setList = (data) => {
    data.forEach((item) => {
      const { instId, changePer1M, changePer1d, changePer1h, changePer1w, changePer5m, lastPrice, zone } = item;

      if (zone !== 'utc8') return;

      const name = item.instId.split('-')[0];

      const changePer = {
        '5m': changePer5m,
        '1h': changePer1h,
        '1d': changePer1d,
        '1w': changePer1w,
        '1M': changePer1M
      }[period.value];

      // 如果 1 小时之内涨幅超过 5%，则设置为重点关注
      setImportantData(name, item.changePer1h > PLAY_UP_RISING_VOLUME);

      const result = {
        ...item,

        name,
        changePer,
        // 涨幅变化显示的文字
        changePerText: formatPercent(changePer),

        // Logo 地址
        logo: `https://static.okx.com/cdn/oksupport/asset/currency/icon/${name.toLowerCase()}.png`,

        // old: minuteAgoData?.[name],

        // 24小时成交量显示的文字
        volume24hText: formatPrice(item.volume24h),

        // 24小时成交额显示的文字
        turnOver24hText: formatPrice(item.turnOver24h),

        // 开盘价（原价）
        open: formatFloat(calcOpen({ changePer, lastPrice }))
      };

      _data[instId] = result;
    });
  };

  return {
    periods,
    period,
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

export const useRing = () => {
  const ring = uni.createInnerAudioContext();

  ring.autoplay = false;
  ring.src = ringtone;
  ring.loop = true;

  ring.onPlay(() => {
    console.log('铃声开始播放');
  });

  ring.onError((res) => {
    console.log('铃声播放错误', res);
  });

  const toggleRing = () => {
    ring.paused ? ring.play() : ring.pause();
  };

  const playRing = () => {
    if (ring.paused) {
      ring.play();
    }
  };

  const pauseRing = () => {
    ring.pause();
  };

  return { playRing, pauseRing, toggleRing, ring };
};

function calcOpen(value) {
  const { changePer, lastPrice } = value;
  return Number(lastPrice) / (1 + Number(changePer));
}
