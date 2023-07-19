<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { formatFloat } from '@/utils/format';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  value: Object
});

const emit = defineEmits(['update:visible']);

const popupRef = ref(null);

const open = () => {
  popupRef.value?.open('bottom');
};

const close = () => {
  popupRef.value?.close();
};

const inputNumInt = ref(0);
const inputNumFloat = ref(0);

const calcResult = computed(() => {
  const openPrice = Number(props.value?.open);

  if (isNaN(openPrice)) return '-';
  if (isNaN(inputNumInt.value)) return '-';
  if (isNaN(inputNumFloat.value)) return '-';

  const n = Number(`${inputNumInt.value}.${inputNumFloat.value}`);

  return Number(formatFloat(Number(openPrice) + Number(openPrice * (n * 0.01))));
});

watch(
  () => props.value?.changePer,
  (val) => {
    if (val) {
      const n = formatFloat(Number(val) * 100).split('.');
      inputNumInt.value = n?.[0] || 0;
      inputNumFloat.value = n?.[1] || 0;
    }
  }
);

watch(
  () => props.visible,
  (val) => {
    val ? open() : close();
  },
  {
    immediate: true
  }
);

onMounted(() => {
  props.visible ? open() : close();
});

const onPopupChange = (e) => {
  const { show } = e;
  emit('update:visible', show);
};
</script>

<template>
  <uni-popup ref="popupRef" background-color="#171717" @change="onPopupChange">
    <div class="calc-price">
      <div class="name">{{ value?.name || '-' }}</div>
      <div class="price">{{ calcResult }}</div>
      <div class="input-box">
        <input v-model="inputNumInt" class="input input--int" type="number" />
        <div class="dot"></div>
        <input v-model="inputNumFloat" class="input input--float" type="number" />
      </div>
    </div>
  </uni-popup>
</template>

<style lang="scss" scoped>
.calc-price {
  padding: 15px;

  .name {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: bold;

    &::before {
      content: '';
      display: block;
      margin-right: 10px;
      width: 4px;
      height: 1em;
      background-color: $uni-color-warning;
      border-radius: 2px;
    }
  }

  .price {
    text-align: center;
    font-size: 20px;
    color: $uni-color-warning;
  }

  .input-box {
    display: flex;
    margin-top: 10px;
    height: 28px;
    color: #fff;

    .dot {
      display: flex;
      justify-content: center;
      align-items: flex-end;
      padding: 0 5px;
      height: 100%;

      &::after {
        content: '';
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background-color: #fff;
      }
    }

    .input {
      width: 100%;
      height: 100%;
      font-size: 14px;
      text-align: center;
      border-bottom: 1px solid $uni-border-color;
    }
  }
}
</style>
