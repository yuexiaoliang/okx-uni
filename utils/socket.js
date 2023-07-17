export const createWebSocket = (url) => {
  return uni.connectSocket({
    url,
    complete() {}
  });
};

export const createWebSocketClient = (options) => {
  let socket = null;
  let pingIntervalId = null;
  let reconnectAttempts = 0;

  const connect = () => {
    socket = uni.connectSocket({
      url: options.url,
      complete() {}
    });

    socket.onOpen(() => {
      console.log('WebSocket连接已打开');
      options.open();
      reconnectAttempts = 0;
      startHeartbeat();
    });

    socket.onMessage((event) => {
      let data = event.data;
      try {
        data = JSON.parse(data);
      } catch (error) {}
      // 处理收到的消息
      options.message(data);
    });

    socket.onClose((event) => {
      console.log('WebSocket连接已关闭:', event.code, event.reason);
      stopHeartbeat();
      reconnect();
    });

    socket.onError((error) => {
      console.error('WebSocket连接发生错误:', error);
      stopHeartbeat();
      reconnect();
    });
  };

  const startHeartbeat = () => {
    stopHeartbeat(); // 先停止之前的心跳定时器

    const sendHeartbeat = () => {
      socket.send('ping');
    };

    pingIntervalId = setInterval(sendHeartbeat, options.pingInterval);
  };

  const stopHeartbeat = () => {
    clearInterval(pingIntervalId);
  };

  const reconnect = () => {
    if (reconnectAttempts >= options.maxReconnectAttempts) {
      console.error('WebSocket连接失败，已达到最大重连次数');
      return;
    }

    reconnectAttempts++;
    console.log(`正在尝试重新连接，第 ${reconnectAttempts} 次`);

    setTimeout(() => {
      connect();
    }, options.reconnectInterval);
  };

  const send = (message) => {
    socket.send({
      data: typeof message === 'string' ? message : JSON.stringify(message)
    });
  };

  const close = () => {
    socket?.close();
  };

  return {
    connect,
    send,
    close
  };
};
