import { ref, reactive, computed, watch } from 'vue';
import dayjs from 'dayjs';

import ringtone from '@/static/audios/ringtone.mp3';

import { formatPrice, formatPercent, formatFloat } from '@/utils/format';
import { useStorageSync } from '@/hooks/storage';

// 重点关注
const importantData = useStorageSync('important-data', {});

// 收藏的列表
const favorites = useStorageSync('favorites-data', []);

export const useRing = () => {
  const ring = uni.createInnerAudioContext();

  ring.autoplay = false;
  ring.src = ringtone;
  ring.loop = true;

  ring.onPlay(() => {
    console.log('铃声开始播放');
  });

  ring.onStop(() => {
    console.log('铃声停止播放');
  });

  ring.onError((res) => {
    console.log('铃声播放错误', res);
  });

  const toggleRing = () => {
    ring.paused ? ring.play() : ring.stop();
  };

  const playRing = () => {
    ring.play();
  };

  const stopRing = () => {
    ring.stop();
  };

  return { playRing, stopRing, toggleRing, ring };
};

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
    delete importantData.value?.[key];
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

// 列表
export const useList = () => {
  const { setImportantData, hasImportantData } = useImportantData();
  const { playRing, stopRing } = useRing();

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

  const _list = computed(() => Object.values(_data).sort((a, b) => b.changePer - a.changePer));

  const list = computed(() => {
    return _list.value.filter((item) => {
      return item.changePer1d > 0;
    });
  });

  const topList = computed(() => {
    return _list.value.filter((item) => {
      return hasImportantData(item.name);
    });
  });

  watch(
    () => topList.value.length,
    (len) => {
      len > 0 ? playRing() : stopRing();
    },
    {
      immediate: true
    }
  );

  const setList = (data) => {
    data.forEach((item) => {
      const { instId, changePer1M, changePer1d, changePer1h, changePer1w, changePer5m, lastPrice, zone } = item;

      if (zone !== 'utc8') return;

      const name = item.instId.split('-')[0];

      const changePer = changePer1d;

      // 如果 5分钟之内涨幅超过 1% 并且 1 小时之内涨幅超过 5%，则设置为重点关注
      setImportantData(name, item.changePer5m > 0.01 && item.changePer1h > 0.05);

      const result = {
        ...item,

        name,
        changePer,
        // 涨幅变化显示的文字
        changePerText: formatPercent(changePer),
        changePer1MText: formatPercent(changePer1M),
        changePer1dText: formatPercent(changePer1d),
        changePer1hText: formatPercent(changePer1h),
        changePer1wText: formatPercent(changePer1w),
        changePer5mText: formatPercent(changePer5m),

        // Logo 地址
        logo: `https://static.okx.com/cdn/oksupport/asset/currency/icon/${name.toLowerCase()}.png`,

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
    topList,
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

function calcOpen(value) {
  const { changePer, lastPrice } = value;
  return Number(lastPrice) / (1 + Number(changePer));
}
