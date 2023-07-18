// 转换为亿、万单位，保留两位小数
export const formatPrice = (price) => {
  const n = Number(price)

  if (isNaN(n)) return price

  if (n >= 100000000) {
    return (n / 100000000).toFixed(2) + '亿'
  } else if (n >= 10000) {
    return (n / 10000).toFixed(2) + '万'
  } else {
    return n.toFixed(2)
  }
}



export const formatPercent = (percent) => {
  const n = Number(percent)
  if (isNaN(n)) return percent
  return (n * 100).toFixed(2) + '%'
}