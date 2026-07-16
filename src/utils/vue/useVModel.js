import { computed } from 'vue'

/**
 * useVModel - 用于简化 v-model prop 传递的 composable
 *
 * 使用方式：
 * import { useVModel } from '@/utils/vue/useVModel'
 *
 * setup(props, { emit }) {
 *   const iVisible = useVModel(props, emit, 'visible')
 *   // 可以直接用于 v-model：
 *   // <Drawer v-model:visible="iVisible" />
 * }
 *
 * @param {Object} props - 组件 props
 * @param {Function} emit - 组件 emit 函数
 * @param {string} propName - prop 名称，如 'visible'
 * @param {string} eventName - 事件名称，默认为 'update:${propName}'
 * @returns {import('vue').WritableComputedRef}
 */
export function useVModel(props, emit, propName, eventName) {
  const updateEventName = eventName || `update:${propName}`

  return computed({
    get() {
      return props[propName]
    },
    set(value) {
      emit(updateEventName, value)
    }
  })
}

export default useVModel
