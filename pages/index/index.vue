<template>
  <ul>
    <li v-for="item in listRaw">{{ item.instId }} - {{ item.changePer }}</li>
  </ul>
</template>

<script setup>
import { ref, watch } from 'vue'
import { createWebSocketClient } from '@/utils/socket'
import { ring } from '@/utils/audio'

const { play } = ring()

const wheelCount = ref(0)
watch(() => wheelCount.value, (val) => {
  if (val % 2 === 0) {
    play()
  }
})

const listRaw = ref([])

const ws = createWebSocketClient({
  url: 'wss://wspri.okx.com:8443/ws/v5/inner-public',
  pingInterval: 30000,
  reconnectInterval: 10000,
  maxReconnectAttempts: 5,

  open() {
    ws.send({
      op: 'subscribe',
      args: [{ channel: 'up-rank-s', ccy: 'USDT' },]
    });
  },

  message(data) {
    if (!data.data?.[0]?.utc8) return;
    listRaw.value = data.data[0].utc8

    if (wheelCount.value > 5000) wheelCount.value = 0;
    wheelCount.value += 1
  }
});
ws.connect()
</script>

<style></style>
