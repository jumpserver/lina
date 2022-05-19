<template>
  <el-form ref="elForm" v-bind="$attrs" :model="value" class="el-form-renderer">
    <template v-for="item in innerContent">
      <slot v-if="!isHidden(item)" :name="`id:${item.id}`" />
      <component
        :is="item.type === GROUP ? 'render-form-group' : 'render-form-item'"
        :key="item.id"
        :data="item"
        :value="value"
        :item-value="value[item.id]"
        :disabled="disabled || item.disabled"
        :readonly="readonly || item.readonly"
        :options="options[item.id]"
        @updateValue="updateValue"
      />
      <slot v-if="!isHidden(item)" :name="`$id:${item.id}`" />
    </template>
    <slot />
  </el-form>
</template>
<script>
import _set from 'lodash.set'
import _isequal from 'lodash.isequal'
import _clonedeep from 'lodash.clonedeep'
import RenderFormGroup from './components/render-form-group.vue'
import RenderFormItem from './components/render-form-item.vue'
import transformContent from './util/transform-content'
import {
  collect,
  mergeValue,
  transformOutputValue,
  transformInputValue,
  correctValue
} from './util/utils'

const GROUP = 'group'

export default {
  name: 'ElFormRenderer',
  components: {
    RenderFormItem,
    RenderFormGroup
  },
  /**
   * value 已经被内部大量使用，所以换用 form
   */
  model: {
    prop: 'form',
    event: 'input'
  },
  props: {
    content: {
      type: Array,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * v-model 的值。传入后会优先使用
     */
    form: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      GROUP,
      /**
       * inputFormat 让整个输入机制复杂了很多。value 有以下输入路径:
       * 1. 传入的 form => inputFormat 处理
       * 2. updateForm => inputFormat 处理
       * 3. 但 content 中的 default 没法经过 inputFormat 处理，因为 inputFormat 要接受整个 value 作为参数
       * 4. 组件内部更新 value，不需要走 inputFormat
       */
      value: {}, // 表单数据对象
      options: {},
      initValue: null
    }
  },
  computed: {
    // 用于兼容数据操作
    innerContent: ({ content }) => transformContent(content)
  },
  watch: {
    form: {
      handler(v, oldV) {
        if (!v || _isequal(v, oldV)) return
        this.setValueFromModel()
      },
      immediate: true,
      deep: true
    },
    innerContent: {
      handler(v) {
        this.options = collect(v, 'options')
        this.setValueFromModel()
        this.initValue = _clonedeep(this.value)
      },
      immediate: true
    },
    value: {
      handler(v, oldV) {
        if (!v || _isequal(v, oldV)) return
        this.$emit('input', transformOutputValue(v, this.innerContent))
      }
      // deep: true, // 应该是没有必要的
    }
  },
  mounted() {
    /**
     * 与 element 相同，在 mounted 阶段存储 initValue
     * @see https://github.com/ElemeFE/element/blob/6ec5f8e900ff698cf30e9479d692784af836a108/packages/form/src/form-item.vue#L304
     */
    this.initValue = _clonedeep(this.value)
    this.$nextTick(() => {
      // proxy
      Object.keys(this.$refs.elForm.$options.methods).forEach(item => {
        if (item in this) return
        this[item] = this.$refs.elForm[item]
      })
      /**
       * 有些组件会 created 阶段更新初始值为合法值，这会触发 validate。目前已知的情况有：
       * - el-select 开启 multiple 时，会更新初始值 undefined 为 []
       * @hack
       */
      this.clearValidate()
    })
  },
  methods: {
    /**
     * 重置表单为初始值
     *
     * @public
     */
    resetFields() {
      /**
       * 之所以不用 el-form 的 resetFields 机制，有以下原因：
       * - el-form 的 resetFields 无视 el-form-renderer 的自定义组件
       * - el-form 的 resetFields 不会触发 input & change 事件，无法监听
       * - bug1: https://github.com/FEMessage/el-data-table/issues/176#issuecomment-587280825
       * - bug2:
       *   0. 建议先在监听器 watch.value 里 // debug(v.name, oldV.name)
       *   1. 打开 basic 示例
       *   2. 在 label 为 name 的输入框里输入 1，此时 log：'1' ''
       *   3. 点击 reset 按钮，此时 log 两条数据： '1' '1', '' ''
       *   4. 因为 _isequal(v, oldV)，所以没有触发 v-model 更新
       */
      this.value = _clonedeep(this.initValue)
      this.$nextTick(this.clearValidate)
    },
    setValueFromModel() {
      if (!this.innerContent.length) return
      /**
       * 没使用 v-model 时才从 default 采集数据
       * default 值没法考虑 inputFormat
       * 参考 value-format.md 的案例。那种情况下，default 该传什么？
       */
      const newValue = this.form
        ? transformInputValue(this.form, this.innerContent)
        : collect(this.innerContent, 'default')
      correctValue(newValue, this.innerContent)
      if (!_isequal(this.value, newValue)) this.value = newValue
    },
    /**
     * 更新表单数据
     * @param  {String} options.id 表单ID
     * @param  {All} options.value 表单数据
     */
    updateValue({ id, value }) {
      this.value = { ...this.value, [id]: value }
    },
    /**
     * @return {object} key is item's id, value is item's value
     * @public
     */
    getFormValue() {
      return transformOutputValue(this.value, this.innerContent)
    },
    /**
     * update form values
     * @param {object} newValue - key is item's id, value is the new value
     * @public
     */
    updateForm(newValue) {
      newValue = transformInputValue(newValue, this.innerContent)
      mergeValue(this.value, newValue, this.innerContent)
      this.value = { ...this.value }
    },
    /**
     * update select options
     * @param {string} id<br>
     * @param {array} options
     * @public
     */
    setOptions(id, options) {
      _set(this.options, id, options)
      this.options = { ...this.options } // 设置之前不存在的 options 时需要重新设置响应式更新
    },
    isHidden(item) {
      if (!item.el || !item.el['hiddenGroup']) {
        return false
      }
      if (item.hidden === true) {
        return true
      }
      if (typeof item.hidden === 'function') {
        return item.hidden(this.value)
      }
      return false
    }
  }
}
</script>
