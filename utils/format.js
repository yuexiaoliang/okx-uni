// 转换为亿、万单位，保留两位小数
export const formatPrice = (price) => {
  if (price >= 100000000) {
    return (price / 100000000).toFixed(2) + '亿'
  } else if (price >= 10000) {
    return (price / 10000).toFixed(2) + '万'
  } else {
    return price.toFixed(2)
  }
}