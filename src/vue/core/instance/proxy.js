/* not type checking this file because flow doesn't play well with Proxy */

import config from 'core/config'
// warn：警告函数
// makeMap：创建一个map类型，闭包返回检测传入值是否在该map上
// isNative：判断是否为原生原型方法（对象）如：Proxy、Promise、Date、Array、Object、Function
import { warn, makeMap, isNative } from '../util/index'

let initProxy

if (process.env.NODE_ENV !== 'production') {
  // 全局变量
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )
  
  // 警告未定义
  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }
  
  // 警告保留前缀
  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals' +
      'See: https://vuejs.org/v2/api/#data',
      target
    )
  }
  
  // 判断是否有原生的Proxy原型对象
  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)

  if (hasProxy) {
    // 保留字段
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
    // 对keyCodes写入条件限制，只允许不在isBuiltInModifier里面的key值才能写入
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }

  // 判断对象是否有某个属性时拦截，典型的操作就是in运算符
  const hasHandler = {
    has (target, key) {
      const has = key in target
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }

  // 用于拦截某个属性的读取操作
  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return target[key]
    }
  }

  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      // handler有get、set、apply、has、construct、deleteProperty、
      // defineProperty、getOwnPropertyDescriptor、getPrototype、isExtensible、
      // ownKeys、preventExtensions、setPrototypeOf
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}

export { initProxy }
