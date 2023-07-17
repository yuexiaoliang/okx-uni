import { ref, watch } from 'vue';

export const useStorageSync = (key, data) => {
  const store = ref(uni.getStorageSync(key) || data);

  watch(
    () => store,
    (newVal) => {
      uni.setStorageSync(key, newVal.value);
    },
    {
      deep: true,
      immediate: true
    }
  );

  return store;
};
