import { provide, inject } from 'vue'

const EMITTER_KEY = Symbol('emitter')

/**
 * useEmitter - 组件间通信的 composable
 * 替代 Emitter mixin（使用 $children/$parent 的旧模式）
 *
 * 使用方式：
 * // 父组件
 * import { useProvideEmitter } from '@/utils/vue/useEmitter'
 * setup() {
 *   useProvideEmitter()
 * }
 *
 * // 子组件
 * import { useInjectEmitter } from '@/utils/vue/useEmitter'
 * setup() {
 *   const emitter = useInjectEmitter()
 *   emitter.dispatch('ComponentName', 'eventName', data)
 * }
 */

/**
 * 在父组件中使用，提供 emitter 功能
 */
export function useProvideEmitter() {
  const listeners = new Map()

  function on(componentName, eventName, callback) {
    const key = `${componentName}:${eventName}`
    if (!listeners.has(key)) {
      listeners.set(key, [])
    }
    listeners.get(key).push(callback)
  }

  function off(componentName, eventName, callback) {
    const key = `${componentName}:${eventName}`
    if (listeners.has(key)) {
      const callbacks = listeners.get(key)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  function emit(componentName, eventName, ...args) {
    const key = `${componentName}:${eventName}`
    if (listeners.has(key)) {
      listeners.get(key).forEach((callback) => callback(...args))
    }
  }

  const emitter = { on, off, emit }
  provide(EMITTER_KEY, emitter)

  return emitter
}

/**
 * 在子组件中使用，注入 emitter 功能
 */
export function useInjectEmitter() {
  const emitter = inject(EMITTER_KEY, null)
  if (!emitter) {
    console.warn('[useEmitter] No emitter provided by parent component')
  }
  return emitter
}

/**
 * 向上查找指定组件并发送事件
 * 替代 dispatch 方法
 */
export function useDispatch() {
  const emitter = useInjectEmitter()

  function dispatch(componentName, eventName, ...args) {
    if (emitter) {
      emitter.emit(componentName, eventName, ...args)
    }
  }

  return { dispatch }
}

/**
 * 向下广播事件到指定组件
 * 替代 broadcast 方法
 */
export function useBroadcast() {
  const emitter = useInjectEmitter()

  function broadcast(componentName, eventName, ...args) {
    if (emitter) {
      emitter.emit(componentName, eventName, ...args)
    }
  }

  return { broadcast }
}

export default {
  useProvideEmitter,
  useInjectEmitter,
  useDispatch,
  useBroadcast
}
