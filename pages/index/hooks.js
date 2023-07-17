import dayjs from 'dayjs';
import { getMinuteAgo } from '@/utils/common';
import { useStorageSync } from '@/hooks/storage';

export const useStore = () => {
  const store = useStorageSync('date-store', []);

  const clearStore = () => {
    const newStore = [];

    store.value.forEach((item) => {
      const [key] = item;

      const n = getMinuteAgo(3);
      if (key < n) {
        return;
      }

      newStore.push(item);
    });

    store.value = newStore;
  };

  const setStoreByList = (list) => {
    clearStore();

    const time = dayjs().format('YYYY-MM-DD HH:mm');

    if (store.value.length > 0 && store.value[0][0] === time) {
      store.value.splice(0, 1);
    }

    const item = [time, {}];

    list.forEach((_item) => {
      item[1][_item.name] = _item.changePer;
    });

    store.value.unshift(item);
  };

  return {
    store,
    setStoreByList
  };
};
