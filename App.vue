<script>
export default {
  onLaunch: function () {
    console.log('App Launch');

    uni.setKeepScreenOn({
      keepScreenOn: true
    });
  },
  onShow: function () {
    console.log('App Show');
  },
  onHide: function () {
    console.log('App Hide');
  }
};
</script>
