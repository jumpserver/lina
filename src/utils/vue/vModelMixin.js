/**
 * vModelMixin - 用于简化 v-model prop 传递的 mixin
 *
 * 使用方式：
 * import vModelMixin from '@/utils/vue/vModelMixin'
 *
 * export default {
 *   mixins: [vModelMixin('visible')],
 *   // 会自动生成 iVisible computed 属性，可以直接用于 v-model：
 *   // <Drawer v-model:visible="iVisible" />
 * }
 *
 * 或者使用多个 prop：
 * mixins: [
 *   vModelMixin('visible'),
 *   vModelMixin('value', 'update:modelValue', 'iValue')
 * ]
 *
 * @param {string} propName - prop 名称，如 'visible'
 * @param {string} eventName - 事件名称，默认为 'update:${propName}'
 * @param {string} computedName - computed 属性名称，默认为 'i${PropName}'（首字母大写）
 */
export default function vModelMixin(propName, eventName, computedName) {
  const updateEventName = eventName || `update:${propName}`
  // 生成 computed 属性名，如 visible -> iVisible, value -> iValue
  const computedPropName =
    computedName || `i${propName.charAt(0).toUpperCase() + propName.slice(1)}`

  return {
    computed: {
      [computedPropName]: {
        get() {
          return this[propName]
        },
        set(value) {
          this.$emit(updateEventName, value)
        }
      }
    }
  }
}
