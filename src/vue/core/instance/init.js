/* @flow */

// 项目配置信息
import config from '../config'
// 代理
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
// 创建时间标志
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  // 初始化配置参数
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    // 区分每一次new Vue()后对象，_uid递增
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // config.performance：时候去记录perf（默认false）
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 避免this被观察到
    vm._isVue = true
    // merge options
    // 合并options配置参数
    // 第一步：options参数处理
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 优化内部组件实例化，因为动态选项合并非常慢，而且没有任何内部组件选项（options）需要特殊处理。
      initInternalComponent(vm, options)
    } else {
      console.log('options', Vue.options);
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor), // 返回Vue.options
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // 第二步：renderProxy
    if (process.env.NODE_ENV !== 'production') {
      // 开发环境，对vm的对象进行代理，即赋值、获取控制
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    // 暴露真正的自己
    vm._self = vm
    // 第三步：vm的生命周期相关属性初始化
    initLifecycle(vm)
    // 第四步：vm时间监听初始化
    initEvents(vm)
    // 第五步：render
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    // 第六步：vm状态初始化，prop/data/computed/method/watch都在这里完成初始化
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    // 计算从初始化vue到created所花费的时间
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    console.log(vm);
    // 绑定元素
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // 这样做是因为它比动态枚举更快。
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  // 如果有父级(即实例中有没有进行继承操作)
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) { // 如果父级options有变化
      // super option changed,
      // need to resolve new options.
      // 更新缓存
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      // 获取值不同的项组合
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        // 更新值
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
