<template>
  <div class="automation-method">
    <el-select
      :disabled="disabled"
      :model-value="iValue"
      :placeholder="$t('Select')"
      class="automation-method__select"
      @change="onMethodChange"
    >
      <el-option v-for="opt in options" :key="opt.value" :label="opt.label" :value="opt.value" />
    </el-select>
    <AutomationParamsSetting
      class="automation-method__append"
      :disabled="disabled"
      :method="iValue"
      :title="paramsTitle"
      :url="paramsUrl"
      :value="currentParams"
      @input="onParamsInput"
    />
  </div>
</template>

<script>
import { inject } from 'vue'
import AutomationParamsSetting from './AutomationParamsSetting'
import { FORM_RENDERER_KEY } from '@/components/Form/DataForm/components/el-form-renderer/el-form-renderer.vue'

export default {
  name: 'AutomationMethodField',
  components: {
    AutomationParamsSetting
  },
  inheritAttrs: false,
  props: {
    // DataForm 通过 :model-value 与 :value 两种方式传入当前值，取其一即可
    modelValue: {
      type: [String, Number],
      default: ''
    },
    value: {
      type: [String, Number],
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false
    },
    paramsTitle: {
      type: String,
      default: ''
    },
    paramsUrl: {
      type: String,
      default: '/api/v1/assets/platform-automation-methods/'
    },
    // 同级 _params 字段的 key，用于从表单上下文读回已保存的参数（编辑时弹窗回填）
    paramsKey: {
      type: String,
      default: ''
    },
    paramsValue: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['change', 'paramsChange'],
  setup() {
    // 注入(automation 子表单的) form-renderer 上下文，用于读回同级 _params 的当前值
    const formCtx = inject(FORM_RENDERER_KEY, { getElForm: null, updateForm: null })
    return { formCtx }
  },
  computed: {
    iValue() {
      return this.modelValue !== '' && this.modelValue != null ? this.modelValue : this.value
    },
    currentParams() {
      // 参数字段已隐藏、值不再经 model-value 传入，这里从当前层表单值实时读回，
      // 保证编辑已有平台时弹窗能回填已保存的参数。
      try {
        const model = this.formCtx?.getElForm?.()?.model
        if (model && this.paramsKey && model[this.paramsKey] != null) {
          return model[this.paramsKey]
        }
      } catch (e) {
        // ignore
      }
      return this.paramsValue || {}
    }
  },
  methods: {
    onMethodChange(val) {
      // 只抛 change：DataForm 的 render-form-item 会据此更新本字段(_method)的值，
      // 并触发字段配置里的 on.change（如 change_secret 的联动）。
      this.$emit('change', val)
    },
    onParamsInput(params) {
      // 参数属于同级的 _params 字段，通过自定义事件让字段配置里的 on.paramsChange
      // 借助 updateForm 写回，避免直接操作只读的表单值。
      this.$emit('paramsChange', params)
    }
  }
}
</script>

<style lang="scss" scoped>
// method 下拉 + 参数设置按钮拼接成 Element Plus 的 input-group 形态:下拉在左、齿轮按钮在右,
// 等高、共用边框、仅两端保留圆角(接缝处平角)。
.automation-method {
  display: flex;
  align-items: stretch;
  width: 100%;
  min-height: 30px;
  gap: 12px;
}

.automation-method__select {
  flex: 1 1 auto;
  min-width: 0;

  :deep(.el-select__wrapper) {
    min-height: 30px;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
}

.automation-method__append {
  flex: 0 0 auto;
  display: flex;
  align-items: stretch;
}
</style>
