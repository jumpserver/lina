<template>
  <div class="all-or-spec">
    <el-radio-group v-model="type" @change="handleTypeChange">
      <el-radio v-for="tp of types" :key="tp.name" :value="tp.name">
        {{ tp.label }}
      </el-radio>
    </el-radio-group>
    <Select2 v-bind="select2" v-if="type === 'spec'" v-model="selected" @change="onChangeEmit" />
  </div>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2.vue'

export default {
  name: 'AllOrSpec',
  components: { Select2 },
  // 根节点是 <div>。父级(DataForm)通过 v-on 绑定了 input/change/update:modelValue 等
  // 监听器，Vue3 默认会把这些透传成根 <div> 的原生 DOM 监听器；内部 el-radio-group 的
  // 原生 radio input/change 事件冒泡上来会带上 target.value(如 "all"/"spec")，污染表单
  // 值，导致 value prop 收到 String 而非 Array 报错。
  // inheritAttrs:false 让这些监听器只留在 $attrs、不绑到根节点，组件只通过显式
  // $emit 更新表单值，彻底杜绝原生事件冒泡污染。
  inheritAttrs: false,
  emits: ['input', 'update:modelValue'],
  props: {
    value: {
      type: Array,
      default: () => []
    },
    select2: {
      type: Object,
      default: () => ({})
    },
    resource: {
      type: String,
      default: ''
    }
  },
  data() {
    const resourceDisplay = this.$t('WordSep') + this.resource.toLowerCase()
    return {
      type: 'all', // all, selected
      types: [
        { name: 'all', label: this.$t('All') + resourceDisplay },
        { name: 'spec', label: this.$t('Spec') + resourceDisplay }
      ],
      selected: []
    }
  },
  computed: {
    iValue() {
      if (this.type === 'all') {
        return ['all']
      } else {
        return this.selected
      }
    }
  },
  mounted() {
    this.syncFromValue(this.value)
  },
  watch: {
    value(val) {
      this.syncFromValue(val)
    }
  },
  methods: {
    syncFromValue(val) {
      if (!Array.isArray(val) || val.length === 0) {
        return
      }
      if (val.indexOf('all') > -1) {
        this.type = 'all'
      } else {
        this.type = 'spec'
        this.selected = val
      }
    },
    emitValue() {
      const payload = this.iValue
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
    },
    onChangeEmit(val) {
      // Select2 @change 可能先于 v-model 回写 selected，优先使用事件参数
      if (Array.isArray(val)) {
        this.selected = val
      }
      this.emitValue()
    },
    handleTypeChange() {
      this.emitValue()
    }
  }
}
</script>

<style lang="scss" scoped>
.all-or-spec {
  width: 100%;

  :deep(.select2) {
    width: 100%;
  }
}
</style>
