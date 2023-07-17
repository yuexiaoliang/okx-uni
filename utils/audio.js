import ringtone from '@/static/audios/ringtone.mp3';

export const ring = () => {
  const manager = uni.createInnerAudioContext();

  manager.autoplay = false;
  // manager.src = ringtone;
  manager.src = 'https://s1.aigei.com/pvaud/aud/mp3/af/aff80e3f644640fbbd4d1ce2cede4113.mp3?e=1689601440&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:7UrHA76yZYKMG951mtNk35C-ymM=';

  manager.onPlay(() => {
    console.log('开始播放');
  });

  manager.onError((res) => {
    console.log(res.errMsg);
    console.log(res.errCode);
  });

  const toggle = () => {
    manager.paused ? manager.play() : manager.pause();
  };

  const play = () => {
    manager.play();
  };

  const pause = () => {
    manager.pause();
  };

  return { play, pause, toggle };
};
