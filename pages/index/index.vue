<script setup>
import { watch } from 'vue';
import { createWebSocketClient } from '@/utils/socket';
import { ring } from '@/utils/audio';
import { getMinuteAfter } from '@/utils/common';
import { formatPercent } from '@/utils/format';
import { useHistoryData, useList, useFavorite, useImportantData } from './hooks';
import { PAUSE_INTERVAL } from '@/constants';

const { setHistoryByTime } = useHistoryData();

const { list, setList } = useList();

const { addToFavorites, hasFavorite } = useFavorite();

const { hasImportantData, setImportantData } = useImportantData();

const { play, pause } = ring();

watch(
  () => list.value,
  (val) => {
    if (!Array.isArray(val)) return;

    setHistoryByTime(val);

    if (val.some((item) => hasImportantData(item.name))) {
      play();
    }
  },
  {
    deep: true,
    immediate: true
  }
);

const ws = createWebSocketClient({
  url: 'wss://wspri.okx.com:8443/ws/v5/inner-public',
  pingInterval: 30000,
  reconnectInterval: 3000,
  maxReconnectAttempts: 20,

  open() {
    ws.send({
      op: 'subscribe',
      args: [{ channel: 'up-rank-s', ccy: 'USDT' }]
    });
  },

  message(data) {
    if (!data.data?.[0]?.utc8) return;
    setList(data.data[0].utc8);
  }
});

const removeFresh = (item) => {
  // 停止响铃
  pause();

  // 使 3 分钟内不再响铃
  setImportantData(item.name, getMinuteAfter(PAUSE_INTERVAL));
};

const getItemRankingChange = (item, index) => {
  return index - item.old.ranking;
};
</script>

<template>
  <ul class="list">
    <li
      v-for="(item, index) in list"
      class="list__item"
      :class="{
        'list__item--fresh': hasImportantData(item.name)
      }"
    >
      <image :src="item.logo" mode="aspectFit" class="logo"></image>

      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="volume">{{ item.turnOver24hText }}</div>
      </div>

      <div class="price">{{ item.lastPrice }}</div>

      <div
        v-if="item.old"
        class="ranking-change"
        :class="{
          'ranking-change--up': getItemRankingChange(item, index) > 0,
          'ranking-change--down': getItemRankingChange(item, index) < 0
        }"
      >
        {{ getItemRankingChange(item, index) === 0 ? '-' : getItemRankingChange(item, index) > 0 ? '↑' : '↓' }}
        {{ getItemRankingChange(item, index) === 0 ? '-' : Math.abs(getItemRankingChange(item, index)) }}
      </div>

      <div
        class="change-per"
        :class="{
          'change-per--up': item.changePer > 0,
          'change-per--down': item.changePer < 0
        }"
      >
        {{ item.changePerText }}
        <div v-if="item.old" class="change">{{ formatPercent(item.changePer - item.old.changePer) }}</div>
      </div>

      <uni-icons v-if="hasImportantData(item.name)" type="circle-filled" size="24" style="color: #fff" class="favorite" @click="removeFresh(item)"></uni-icons>

      <uni-icons v-else :type="hasFavorite(item.name) ? 'star-filled' : 'star'" size="24" class="favorite" :class="{ 'favorite--true': hasFavorite(item.name) }" @click="addToFavorites(item)"></uni-icons>
    </li>
  </ul>
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

  &__item {
    display: flex;
    align-items: center;
    padding: $uni-spacing-col-base $uni-spacing-row-base;
    margin: 0;
    margin-bottom: $uni-spacing-col-base;
    background-color: $uni-bg-color-grey;
    border-radius: $uni-border-radius;

    &--fresh {
      animation: bg-color-change 0.7s infinite alternate;

      @keyframes bg-color-change {
        0% {
          background-color: $uni-bg-color-grey;
        }

        100% {
          background-color: $uni-color-primary;
        }
      }
    }

    .logo {
      margin-right: $uni-spacing-row-sm;
      width: 36px;
      height: 36px;
    }

    .info {
      display: flex;
      flex-direction: column;

      .name {
        font-size: $uni-font-size-base;
      }

      .volume {
        font-size: $uni-font-size-sm;
        color: $uni-text-color-grey;
      }
    }

    .price {
      font-weight: bold;
      margin-left: auto;
    }

    .ranking-change {
      margin-left: $uni-spacing-row-sm;
      width: 30px;
      text-align: right;

      &--up {
        color: $uni-color-warning;
      }

      &--down {
        color: $uni-color-error;
      }
    }

    .change-per {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin-left: 12px;
      padding: 3px 0;
      width: 62px;
      min-height: 18px;
      line-height: 1;
      background-color: $uni-bg-color;
      border-radius: 2px;

      &--up {
        background-color: $uni-color-success;
      }

      &--down {
        background-color: $uni-color-error;
      }

      .change {
        margin-top: 3px;
        font-size: $uni-font-size-sm;
        color: #000;
        transform: scale3d(0.8, 0.8, 1);
      }
    }

    .favorite {
      margin-left: $uni-spacing-row-sm;
      color: $uni-text-color-grey;

      &--true {
        color: $uni-color-warning !important;
      }
    }
  }
}
</style>
