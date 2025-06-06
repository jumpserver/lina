<template>
  <el-form-item
    v-if="_show"
    :class="classes"
    :label="data.label"
    :prop="prop"
    :rules="_show && Array.isArray(data.rules) ? data.rules : []"
    v-bind="data.attrs"
  >
    <template v-if="data.label" #label>
      <span :title="data.label">
        <span v-if="data.required">* </span>
        {{ data.label }}
        <el-tooltip
          v-if="data.helpTip"
          :open-delay="500"
          :tabindex="-1"
          effect="dark"
          placement="right"
          popper-class="help-tips"
        >
          <div slot="content" v-sanitize="data.helpTip" class="help-tip-content" /> <!-- Noncompliant -->
          <i class="fa fa-question-circle-o help-tip-icon" />
        </el-tooltip>
      </span>
    </template>
    <template v-if="readonly && hasReadonlyContent">
      <div
        v-if="data.type === 'input'"
        :style="
          componentProps.type === 'textarea'
            ? {padding: '10px 0', lineHeight: 1.5}
            : ''
        "
      >
        {{ itemValue }}
      </div>
      <div v-else-if="data.type === 'select'">
        <template>
          {{ multipleValue }}
        </template>
      </div>
    </template>
    <custom-component
      v-else
      :component="data.component || `el-${data.type}`"
      :disabled="disabled || componentProps.disabled || readonly"
      :value="itemValue"
      v-bind="componentProps"
      v-on="listeners"
    >
      <template v-for="opt in options">
        <el-option
          v-if="data.type === 'select'"
          :key="opt.label"
          v-bind="opt"
        />
        <el-checkbox-button
          v-else-if="data.type === 'checkbox-group' && data.style === 'button'"
          :key="opt.value"
          :label="'value' in opt ? opt.value : opt.label"
          v-bind="opt"
        >
          {{ opt.label }}
        </el-checkbox-button>

        <el-checkbox
          v-else-if="data.type === 'checkbox-group' && data.style !== 'button'"
          :key="opt.value"
          :label="'value' in opt ? opt.value : opt.label"
          v-bind="opt"
        >
          {{ opt.label }}
          <el-tooltip v-if="opt.tip" :content="opt.tip" :open-delay="500" placement="top">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
          <span v-if="data.helpText">{{ data.helpText }}</span>
        </el-checkbox>
        <!-- WARNING: radio 用 label 属性来表示 value 的含义 -->
        <!-- FYI: radio 的 value 属性可以在没有 radio-group 时用来关联到同一个 v-model -->
        <el-radio
          v-else-if="data.type === 'radio-group'"
          :key="opt.label"
          :label="'value' in opt ? opt.value : opt.label"
          v-bind="opt"
        >
          {{ opt.label }}
          <el-tooltip v-if="opt.tip" :content="opt.tip" :open-delay="500" placement="top">
            <i class="el-icon-warning-outline" />
          </el-tooltip>
        </el-radio>
      </template>
    </custom-component>
    <div v-if="data.helpText" :class="data.type" class="help-block">
      <el-alert
        v-if="data.helpText.startsWith('!')"
        :closable="false"
        class="help-warning"
        show-icon
        type="info"
      >
        <span v-sanitize="data.helpText.replace(/^!/, '')" />
      </el-alert>
      <span v-else v-sanitize="data.helpText" />
    </div>
    <div v-if="data.helpTextFormatter" class="help-block">
      <RenderHelpTextSafe :render-content="data.helpTextFormatter" />
    </div>
  </el-form-item>
</template>
<script>
import getEnableWhenStatus from '../util/enable-when'
import { noop } from '../util/utils'
import _get from 'lodash.get'
import _includes from 'lodash.includes'
import _topairs from 'lodash.topairs'
import _frompairs from 'lodash.frompairs'

function validator(data) {
  if (!data) {
    throw new Error('data must be an Object.')
  } else if (!data.id) {
    throw new Error('`id` is unvalidated.')
  } else if (!data.type && !data.component) {
    throw new Error('`type` and `component` cannot both be null.')
  }
}

export default {
  components: {
    RenderHelpTextSafe: {
      functional: true,
      props: {
        renderContent: {
          type: Function,
          required: true
        }
      },
      render(h, { props }) {
        return props.renderContent()
      }
    },
    /**
     * 🐂🍺只需要有组件选项对象，就可以立刻包装成函数式组件在 template 中使用
     * FYI: https://cn.vuejs.org/v2/guide/render-function.html#%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BB%84%E4%BB%B6
     */
    CustomComponent: {
      functional: true,
      render: (h, ctx) => h(ctx.props.component, ctx.data, ctx.children)
    }
  },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    data: Object,
    prop: {
      type: String,
      default() {
        return this.data.id
      }
    },
    // eslint-disable-next-line vue/require-prop-types,vue/require-default-prop
    itemValue: {},
    // eslint-disable-next-line vue/require-default-prop
    value: Object,
    disabled: Boolean,
    readonly: Boolean,
    // eslint-disable-next-line vue/require-default-prop
    options: Array
  },
  data() {
    return {
      propsInner: {},
      isBlurTrigger: this.data.rules &&
        this.data.rules.some(rule => {
          return rule.required && rule.trigger === 'blur'
        })
    }
  },
  computed: {
    // 解构运算符会处理 undefined 的情况
    componentProps: ({ data: { el }, propsInner }) => ({ ...el, ...propsInner }),
    hasReadonlyContent: ({ data: { type }}) => _includes(['input', 'select'], type),
    hiddenStatus: ({ data: { hidden = () => false }, data, value }) => hidden(value, data),
    enableWhenStatus: ({ data: { enableWhen }, value }) => getEnableWhenStatus(enableWhen, value),
    // 是否显示
    _show() {
      return !this.hiddenStatus && this.enableWhenStatus
    },
    classes() {
      return 'el-form-item-' + this.data.prop + ' ' + (this.data.attrs?.class || '')
    },
    listeners() {
      const {
        data: {
          id,
          atChange = noop,
          on = {},
          on: { input: originOnInput = noop, change: originOnChange = noop } = {},
          trim = true
        },
        $parent: {
          $parent: { updateForm }
        }
      } = this
      return {
        ..._frompairs(
          _topairs(on).map(([eName, handler]) => [
            eName,
            (...args) => handler(args, updateForm)
          ]),
        ),
        // 手动更新表单数据
        input: (value, ...rest) => {
          this.$emit('updateValue', { id, value })
          // 更新表单时调用
          atChange(id, value)
          originOnInput([value, ...rest], updateForm)

          // FIXME: rules 的 trigger 只写了 blur，依然会在 input 的时候触发校验！
          this.triggerValidate(id)
        },
        change: (value, ...rest) => {
          if (typeof value === 'string' && trim) value = value.trim()
          this.$emit('updateValue', { id, value })
          originOnChange([value, ...rest], updateForm)

          // FIXME: rules 的 trigger 只写了 blur，依然会在 change 的时候触发校验！
          this.triggerValidate(id)
        }
      }
    },

    multipleValue: ({ data, itemValue, options = [] }) => {
      const multipleSelectValue =
        _get(data, 'el.multiple') && Array.isArray(itemValue)
          ? itemValue
          : [itemValue]
      return multipleSelectValue
        .map(val => (options.find(op => op.value === val) || {}).label)
        .join()
    }
  },
  watch: {
    data: validator,
    /**
     * 这里其实用 remote 处理了两件事。有机会是可以拆分的
     * 1. 基本用法，配置 url 后即可从远程获取某个 prop 注入到组件
     * 2. 针对 select、checkbox-group & radio-group 组件，会直接将 resp 作为 options 处理；label & value 也是直接为这个场景而生的
     */
    'data.remote': {
      handler(v, oldV) {
        if (!v) return
        if (oldV) {
          if (v.url === oldV.url || v.request === oldV.request) return
        }
        const isOptionsCase =
          ['select', 'checkbox-group', 'radio-group'].indexOf(this.data.type) >
          -1
        const {
          url,
          request = () => this.$axios.get(url).then(resp => resp.data),
          prop = 'options', // 默认处理 el-cascader 的情况
          dataPath = '',
          onResponse = resp => {
            if (dataPath) resp = _get(resp, dataPath)
            if (isOptionsCase) {
              return resp.map(item => ({
                label: item[label],
                value: item[value]
              }))
            } else {
              return resp
            }
          },
          onError = error => console.error(error.message),
          label = 'label',
          value = 'value'
        } = v
        Promise.resolve(request())
          .then(onResponse, onError)
          .then(resp => {
            if (isOptionsCase) {
              let formRenderer = this.$parent
              while (formRenderer.$options._componentTag !== 'el-form-renderer') {
                formRenderer = formRenderer.$parent
              }
              formRenderer.setOptions(this.prop, resp)
            } else {
              this.propsInner = { [prop]: resp }
            }
          })
      },
      immediate: true
    }
  },
  methods: {
    triggerValidate(id) {
      if (!this.data.rules || !this.data.rules.length) return

      /**
       * 下面代码可参考 `emitter`
       * 目的: 为了清除表单校验信息
       * 因为有部分表单项的值变更时没有清除校验信息, 因此需要触发一次校验用于清除
       * https://github.com/ElemeFE/element/blob/dev/src/mixins/emitter.js
       */
      let parent = this.$parent
      let name = parent.$options.componentName

      while (parent && name !== 'ElForm') {
        parent = parent.$parent

        if (parent) {
          name = parent.$options.componentName
        }
      }

      if (!parent || this.isBlurTrigger) return

      this.$nextTick(() => {
        parent.validateField(id)
      })
    }
  }
}
</script>
<style lang='scss' scoped>
.help-tips {
  opacity: 0.8;
  line-height: 2;
  width: 300px;
}

.help-block {
  ::v-deep .el-alert__icon {
    font-size: 16px
  }

  &.checkbox {
    //display: inline;
  }
}

.help-tip-icon {
  &:hover {
    cursor: pointer;
  }
}

.help-tip-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
