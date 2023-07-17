import { ref, watch } from 'vue';

export const useStorageSync = (key, data) => {
  const storage = ref(uni.getStorageSync(key) || data);

  watch(
    storage,
    (newVal) => {
      uni.setStorageSync(key, newVal);
    },
    {
      deep: true,
      immediate: true
    }
  );

  return storage;
};
