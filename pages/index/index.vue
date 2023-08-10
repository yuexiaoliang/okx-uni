<script setup>
import { ref } from 'vue';
import dayjs from 'dayjs';
import { createWebSocketClient } from '@/utils/socket';
import { useList } from './hooks';
import Calc from '@/components/calc.vue';
import ListItem from './components/list-item.vue';

const { list, topList, setList } = useList();

const ws = createWebSocketClient({
  url: 'wss://wspri.okx.com:8443/ws/v5/ipublic',
  pingInterval: 30000,
  reconnectInterval: 1000,
  maxReconnectAttempts: 20,

  open() {
    ws.send({
      op: 'subscribe',
      args: [{ channel: 'web-up-down-rank-s', ccy: 'USDT' }]
    });
  },

  message(data) {
    if (data?.arg?.channel !== 'web-up-down-rank-s') return;
    if (!Array.isArray(data?.data)) return;

    const time = dayjs().format('YYYY-MM-DD HH:mm:ss');
    setList(data.data.map((item) => ({ ...item, time })));
  }
});

const currentItem = ref({});
const calcVisible = ref(false);
const onItemClick = (item) => {
  currentItem.value = item;
  calcVisible.value = true;
};
</script>

<template>
  <ul class="list">
    <list-item v-for="item in topList" :key="item.name" :value="item" is-top></list-item>

    <list-item v-for="item in list" :key="item.name" :value="item" @click="onItemClick(item)"></list-item>
  </ul>

  <calc v-model:visible="calcVisible" :value="currentItem" />
</template>

<style lang="scss">
page {
  background-color: $uni-bg-color;
  color: $uni-text-color;
  font-size: $uni-font-size-sm;
}

.list {
  padding: 0 $uni-spacing-col-base $uni-spacing-row-base;
  margin: 0;
  list-style: none;
}
</style>
