// 设置屏幕常亮
export const setKeepScreenOn = () => {
  uni.setKeepScreenOn({
    keepScreenOn: true,

    fail() {
      uni.showToast({
        title: '屏幕常亮失败',
        icon: 'error'
      });
    }
  });
};
