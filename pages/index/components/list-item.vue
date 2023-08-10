<script setup>
import { computed } from 'vue';
import { getMinuteAfter } from '@/utils/common';
import { PAUSE_INTERVAL } from '@/constants';
import { useFavorite, useImportantData } from '../hooks';

const emit = defineEmits(['click']);

const props = defineProps({
  value: {
    type: Object,
    default: () => ({})
  },
  isTop: {
    type: Boolean,
    default: false
  }
});

const logo = computed(() => `url(${props.value?.logo})`);

const { addToFavorites, hasFavorite } = useFavorite();
const { setImportantData, hasImportantData } = useImportantData();

const removeFresh = (item) => {
  // 使 3 分钟内不再响铃
  setImportantData(item.name, getMinuteAfter(PAUSE_INTERVAL));
};
</script>

<template>
  <li
    class="list__item"
    :class="{
      'list__item--fresh': hasImportantData(value.name) && isTop
    }"
    @click="emit('click', value)"
  >
    <div class="info">
      <div class="top">
        <div class="name">{{ value.name }}</div>
        <div class="volume">{{ value.turnOver24hText }}</div>
      </div>
      <div class="bottom">{{ value.lastPrice }}</div>
    </div>

    <div class="change-per-box">
      <div
        class="change-per"
        :class="{
          'change-per--up': value.changePer5m > 0,
          'change-per--down': value.changePer5m < 0
        }"
      >
        {{ value.changePer5mText }}
      </div>

      <div
        class="change-per"
        :class="{
          'change-per--up': value.changePer1h > 0,
          'change-per--down': value.changePer1h < 0
        }"
      >
        {{ value.changePer1hText }}
      </div>

      <div
        class="change-per"
        :class="{
          'change-per--up': value.changePer > 0,
          'change-per--down': value.changePer < 0
        }"
      >
        {{ value.changePerText }}
      </div>
    </div>

    <div v-if="hasImportantData(value.name) && isTop" @click.capture.stop="removeFresh(value)">
      <uni-icons type="circle-filled" size="24" style="color: #fff" class="favorite"></uni-icons>
    </div>

    <div v-else @click.stop="addToFavorites(value)">
      <uni-icons :type="hasFavorite(value.name) ? 'star-filled' : 'star'" size="24" class="favorite" :class="{ 'favorite--true': hasFavorite(value.name) }"></uni-icons>
    </div>
  </li>
</template>

<style lang="scss" scoped>
.list__item {
  position: relative;
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

  &::before {
    content: '';
    height: 34px;
    width: 34px;
    background-image: v-bind(logo);
    background-size: cover;
    background-position: left center;
    background-repeat: no-repeat;
    border-radius: 50%;
  }

  .info {
    display: flex;
    flex-direction: column;
    margin-right: auto;
    margin-left: 8px;
    font-size: $uni-font-size-sm;

    .top {
      display: flex;
      .name {
        font-weight: bold;
      }

      .volume {
        margin-left: 7px;
        color: $uni-text-color-grey;
      }
    }

    .bottom {
      color: $uni-color-success;
    }
  }
  .change-per-box {
    display: flex;
    margin-right: 3px;

    .change-per {
      margin-left: 10px;
      color: $uni-text-color-grey;

      &--up {
        color: $uni-color-warning;
      }

      &--down {
        color: $uni-color-error;
      }
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
</style>
