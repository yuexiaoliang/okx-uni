<script setup>
import { ref, watch, computed } from 'vue'
import { createWebSocketClient } from '@/utils/socket'
import { ring } from '@/utils/audio'
import { formatPrice } from '@/utils/format'
import { useStorageSync } from '@/hooks/storage'

const { play, pause } = ring()

const wheelCount = ref(0)

const favoriteList = useStorageSync('okx-favorite', [])
const listRaw = ref([])

let oldList = []
const list = ref([])

const setList = () => {
  list.value = listRaw.value.map(item => {
    const name = item.instId.split('-')[0]
    const result = {
      ...item,
      name,
      changePerText: (Number(item.changePer) * 100).toFixed(2) + '%',
      isFresh: false,
      isFavorite: favoriteList.value.includes(item.instId),
      logo: `https://static.okx.com/cdn/oksupport/asset/currency/icon/${name.toLowerCase()}.png`,
      wheelCount: 1,
      volume24hText: formatPrice(item.volume24h),
    }

    if (!oldList.length) return result

    const oldItem = oldList.find(old => old.instId === item.instId)

    if (!oldItem) {
      return result
    }

    result.wheelCount = oldItem.wheelCount + 1
    result.isFresh = result.wheelCount < wheelCount.value && result.wheelCount <= 10

    const oldIndex = oldList.indexOf(oldItem)
    const newIndex = listRaw.value.indexOf(item)

    const rankingChange = oldIndex - newIndex
    const rankingChangeText = rankingChange ? rankingChange > 0 ? `↑ ${rankingChange}` : `↓ ${Math.abs(rankingChange)}` : ''

    if (rankingChange !== oldItem.rankingChange) {
      result.rankingChange = rankingChange
      result.rankingChangeText = rankingChangeText
    }

    return result
  })

}

watch(() => list.value, (val, old) => {
  oldList = val

  if (Array.isArray(val) && val.some(item => item.isFresh)) {
    play()
  }
}, {
  deep: true,
  immediate: true
})

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
    setList()

    if (wheelCount.value > 5000) wheelCount.value = 0;
    wheelCount.value += 1
  }
});
ws.connect()

const onFavoriteClick = (item) => {
  if (item.isFavorite) {
    favoriteList.value = favoriteList.value.filter(fav => fav !== item.instId)
  } else {
    favoriteList.value = [...favoriteList.value, item.instId]
  }
}

const removeFresh = (item) => {
  item.isFresh = false
  pause()
}
</script>

<template>
  <ul class="list">
    <li v-for="item in list" class="list__item" :class="{
      'list__item--fresh': item.isFresh,
    }">
      <image :src="item.logo" mode="aspectFit" class="logo"></image>

      <div class="info">
        <div class="name">{{ item.name }}</div>
        <div class="volume">{{ item.volume24hText }}</div>
      </div>

      <div class="price">{{ item.lastPrice }}</div>

      <div class="change-per" :class="{
        'change-per--up': item.changePer > 0,
        'change-per--down': item.changePer < 0,
      }">{{ item.changePerText }}</div>

      <uni-icons v-if="item.isFresh" type="circle-filled" size="24" style="color: #fff" class="favorite"
        @click="removeFresh(item)"></uni-icons>
      <uni-icons v-else :type="item.isFavorite ? 'star-filled' : 'star'" size="24" class="favorite"
        :class="{ 'favorite--true': item.isFavorite }" @click="onFavoriteClick(item)"></uni-icons>
    </li>
  </ul>
  <div class="footer-bar">123</div>
</template>

<style lang="scss" scoped>
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
      animation: bg-color-change .7s infinite alternate;

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

    .change-per {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: $uni-spacing-row-base;
      width: 62px;
      height: 20px;
      background-color: $uni-bg-color;
      border-radius: 2px;

      &--up {
        background-color: $uni-color-success;
      }

      &--down {
        background-color: $uni-color-error;
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
