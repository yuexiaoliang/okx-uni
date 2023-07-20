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
  popupRef.value?.open('center');
};

const close = () => {
  popupRef.value?.close();
};

// 价格
const price = ref(0);
// 百分比整数部分
const percentInt = ref(0);
// 百分比小数部分
const percentFloat = ref(0);

// 计算价格
const computedPrice = () => {
  const openPrice = Number(props.value?.open);

  if (isNaN(openPrice)) return '-';
  if (isNaN(percentInt.value)) return '-';
  if (isNaN(percentFloat.value)) return '-';

  const n = Number(`${percentInt.value}.${percentFloat.value}`);

  price.value = Number(formatFloat(Number(openPrice) + Number(openPrice * (n * 0.01))));
};

// 涨幅改变时，更新百分比
watch(
  () => props.value,
  (val) => {
    setPercents(val.changePer);
    computedPrice();
  },
  {
    immediate: true,
    deep: true
  }
);

// 根据 visible 更新 popup 的显示状态
watch(
  () => props.visible,
  (val) => {
    val ? open() : close();
  },
  {
    immediate: true
  }
);

// 首次渲染时，根据 visible 更新 popup 的显示状态
onMounted(() => {
  props.visible ? open() : close();
});

// popup 的显示状态改变时，更新 visible
const onPopupChange = (e) => {
  const { show } = e;
  emit('update:visible', show);
};

// 价格输入时，更新百分比
const onPriceInput = (e) => {
  const {
    detail: { value }
  } = e;
  const open = props.value?.open;
  const changePer = (value - open) / open;

  setPercents(changePer);
};

// 百分比输入时，更新价格
const onPercentChange = () => {
  computedPrice();
};

// 设置百分比
function setPercents(num) {
  if (isNaN(Number(num))) return;

  let n = num * 100;
  n = Number(n).toFixed(2).split('.');

  percentInt.value = n?.[0] || 0;
  percentFloat.value = n?.[1] || 0;
}
</script>

<template>
  <uni-popup ref="popupRef" background-color="#171717" @change="onPopupChange">
    <div class="calc-price">
      <div class="name">{{ value?.name || '-' }}</div>

      <input v-model="price" type="number" class="price" @input="onPriceInput" />

      <div class="input-box">
        <input v-model="percentInt" class="input input--int" type="number" @input="onPercentChange" />

        <div class="dot"></div>
        <input v-model="percentFloat" class="input input--float" type="number" @input="onPercentChange" />
      </div>
    </div>
  </uni-popup>
</template>

<style lang="scss" scoped>
.calc-price {
  width: 70vw;
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
    padding: 10px 0;
    text-align: center;
    font-size: 22px;
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
      height: 100%;
      font-size: 16px;
      text-align: center;
      border-bottom: 1px solid $uni-border-color;
    }
  }
}
</style>
