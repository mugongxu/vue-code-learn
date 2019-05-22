// 是否处在浏览器上
import { inBrowser } from './env'

export let mark
export let measure

if (process.env.NODE_ENV !== 'production') {
  const perf = inBrowser && window.performance
  /* istanbul ignore if */
  if (
    perf &&
    perf.mark &&
    perf.measure &&
    perf.clearMarks &&
    perf.clearMeasures
  ) {
    // 通过给定的名称，将该名称作为键和对应的DOMHighResTimeStamp作为值，存在一个哈希结构里
    // 值：通常为navigationStart到记录时刻的时间间隔毫秒数
    // 多次记录可获取操作间的时间差
    mark = tag => perf.mark(tag)
    // 记录startTag（entryType：mark）与endTag（entryType：mark）的差值
    // 如果startTag和endtag不存在，则是为navigationStart到记录时刻的时间间隔毫秒数
    measure = (name, startTag, endTag) => {
      perf.measure(name, startTag, endTag)
      // 清除mark
      perf.clearMarks(startTag)
      perf.clearMarks(endTag)
      // 清除measures
      // perf.clearMeasures(name)
    }
  }
}
