// 设置屏幕常亮
export const setKeepScreenOn = () => {
  uni.setKeepScreenOn({
    keepScreenOn: true,

    success() {
      uni.showToast({
        title: '屏幕常亮成功',
        icon: 'success'
      });
    },

    fail() {
      uni.showToast({
        title: '屏幕常亮失败',
        icon: 'error'
      });
    }
  });
};
