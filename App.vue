<script>
import { setKeepScreenOn } from '@/utils/system'

export default {
  onLaunch: function () {
    console.log('App Launch');
  },

  onShow: function () {
    console.log('App Show');

    // 设置屏幕常亮
    setKeepScreenOn()
  },

  onHide: function () {
    console.log('App Hide');
  }
};
</script>
