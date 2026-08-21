<template>
  <div class="code-editor" style="font-size: 12px">
    <el-form ref="form" :model="formModel" :rules="rules" label-position="top" label-width="80px">
      <div class="form-content">
        <template v-for="(item, index) in iActions" :key="index">
          <el-form-item
            v-if="!(item.type === 'button' && item.isVisible)"
            :label="item.type === 'button' ? '' : item.name"
            :prop="item.name"
          >
            <template v-if="item.type === 'button' && !item.isVisible">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <el-button
                  :type="item.el && item.el.type"
                  class="start-stop-btn"
                  :disabled="item.disabled"
                  size="small"
                  @click="item.callback()"
                >
                  <i :class="item.icon" />
                </el-button>
              </el-tooltip>
            </template>

            <template v-if="item.type === 'input' && item.el && item.el.autoComplete">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <span class="inline-input">
                  <el-autocomplete
                    v-model="formModel[item.name]"
                    :fetch-suggestions="item.el.query"
                    :placeholder="item.placeholder"
                    class="inline-input jms-input-spacing"
                    size="small"
                    clearable
                    @change="handleInputChange(item)"
                    @select="handleInputChange(item)"
                  />
                </span>
              </el-tooltip>
            </template>

            <template v-else-if="item.type === 'input'">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <el-input
                  v-model="formModel[item.name]"
                  :class="!isFold ? 'special-style' : ''"
                  :placeholder="item.placeholder"
                  class="inline-input jms-input-spacing"
                  size="small"
                  @change="item.callback(formModel[item.name])"
                />
              </el-tooltip>
            </template>

            <template v-if="item.type === 'select' && item.el && item.el.create">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <span>
                  <span class="filter-label">{{ item.name }}:</span>
                  <el-select
                    v-if="item.type === 'select' && item.el && item.el.create"
                    :key="index"
                    v-model="formModel[item.name]"
                    :allow-create="item.el.create || false"
                    :filterable="item.el.create || false"
                    :multiple="item.el.multiple"
                    :placeholder="item.name"
                    class="autoWidth-select"
                    default-first-option
                    size="small"
                    @change="item.callback(item.value)"
                  >
                    <template #prefix>{{ item.label + ':' + item.value }}</template>
                    <el-option
                      v-for="(option, id) in item.options"
                      :key="id"
                      :label="option.label"
                      :title="option.value"
                      :value="option.value"
                    />
                  </el-select>
                </span>
              </el-tooltip>
            </template>

            <template v-if="item.type === 'select' && (!item.el || !item.el.create)">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <el-select
                  v-model="formModel[item.name]"
                  class="toolbar-select"
                  @change="
                    (val) => {
                      item.value = val
                      item.callback(val)
                    }
                  "
                >
                  <el-option
                    v-for="(option, i) in item.options"
                    :key="i"
                    :label="option.label"
                    :value="option.value"
                  />
                </el-select>
              </el-tooltip>
            </template>

            <template v-if="item.type === 'switch'">
              <el-tooltip :disabled="!item.tip" :content="item.tip">
                <el-switch
                  v-model="formModel[item.name]"
                  :active-text="item.name"
                  :disabled="item.disabled"
                  @change="item.callback(formModel[item.name])"
                />
              </el-tooltip>
            </template>
          </el-form-item>
        </template>
        <div
          v-if="Object.prototype.hasOwnProperty.call(toolbar, 'fold')"
          :class="!isFold ? 'sepcial-icon' : ''"
          class="fold"
        >
          <el-tooltip :content="$tc('MoreActions')" :show-after="500" placement="top">
            <i
              :class="[isFold ? 'fa-angle-double-right' : 'fa-angle-double-down']"
              class="fa"
              @click="onChangeFold"
            />
          </el-tooltip>
        </div>
      </div>
      <div class="right-side">
        <div v-for="(item, index) in toolbar.right" :key="index">
          <el-tooltip :content="item.tip" :show-after="500">
            <el-button
              v-if="item.type === 'button'"
              :disabled="item.disabled"
              size="small"
              type="default"
              @click="item.callback()"
            >
              <i v-if="item.icon.startsWith('fa')" :class="'fa ' + item.icon" />
              <svg-icon v-else :icon-class="item.icon" style="font-size: 14px" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-form>
    <codemirror
      ref="myCm"
      v-model="iValue"
      :extensions="extensions"
      :tab-size="iOptions.tabSize || 4"
      :placeholder="iOptions.placeholder"
      :autofocus="iOptions.autofocus"
      :disabled="!!iOptions.readOnly"
      :style="editorStyle"
      class="editor"
    />
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { basicSetup } from 'codemirror'
import { StreamLanguage } from '@codemirror/language'
import { shell } from '@codemirror/legacy-modes/mode/shell'
import { powerShell } from '@codemirror/legacy-modes/mode/powershell'
import { python } from '@codemirror/legacy-modes/mode/python'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { ruby } from '@codemirror/legacy-modes/mode/ruby'

const MODE_MAP = {
  shell,
  bash: shell,
  sh: shell,
  powershell: powerShell,
  win_shell: powerShell,
  python,
  yaml,
  ruby
}

export default {
  components: {
    codemirror: Codemirror
  },
  emits: ['input', 'update:modelValue'],
  props: {
    toolbar: {
      type: [Array, Object],
      default: () => []
    },
    modelValue: {
      type: [String, Object],
      default: () => ''
    },
    options: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      isFold: true,
      formModel: {}
    }
  },
  computed: {
    iActions() {
      let actionsObj = this.toolbar.left || {}
      const fold = this.toolbar.fold || {}
      if (!this.isFold) {
        actionsObj = { ...actionsObj, ...fold }
      }

      // 将对象转换为数组
      const actions = Object.values(actionsObj)

      actions.forEach((action) => {
        if (!Object.prototype.hasOwnProperty.call(this.formModel, action.name)) {
          this.formModel[action.name] = action.value || ''
        }
      })

      return actions
    },
    rules() {
      let actionsObj = this.toolbar.left || {}
      const fold = this.toolbar.fold || {}
      if (!this.isFold) {
        actionsObj = { ...actionsObj, ...fold }
      }

      const rules = {}

      Object.values(actionsObj).forEach((action) => {
        if (action.name === this.$t('RunAs') && action.type === 'input') {
          rules[action.name] = [
            { required: true, message: this.$t('RequiredRunas'), trigger: 'blur' }
          ]
        }
      })

      return rules
    },
    iValue: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
        this.$emit('input', val)
      }
    },
    iOptions() {
      const defaultOptions = {
        tabSize: 4,
        mode: 'shell',
        autofocus: true
      }
      return Object.assign(defaultOptions, this.options)
    },
    extensions() {
      const exts = [basicSetup]
      const mode = MODE_MAP[this.iOptions.mode]
      if (mode) {
        exts.push(StreamLanguage.define(mode))
      }
      return exts
    },
    editorStyle() {
      return { height: this.iOptions.height || '300px' }
    }
  },
  methods: {
    onChangeFold() {
      this.isFold = !this.isFold
    },
    getLabel(value, items) {
      for (const item of items) {
        if (item.value === value) {
          return item.label
        }
      }
    },
    handleInputChange(item) {
      item.callback(this.formModel[item.name])
      this.$refs.form.validateField(item.name)
    }
  }
}
</script>

<style lang="scss" scoped>
.code-editor {
  display: flex;
  flex-direction: column;
  width: 100%;

  .el-form {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    margin-bottom: 16px;

    .form-content {
      display: flex;
      flex: 12;
      align-items: flex-end;

      .el-form-item {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin-bottom: 0;
        margin-right: 5px;

        // input 框与 label 相关样式
        :deep(.el-form-item__label) {
          display: flex;
          justify-items: flex-start;
          align-items: center;
          height: 20px;
          padding-bottom: 5px !important;
          color: var(--color-text-secondary);
          font-weight: 700;
          font-size: 11px;
        }

        // 全局 .el-form .el-form-item__content 设了 line-height:32px,会让 runas 的 autocomplete
        // (外层是 inline 的 <span>)按 32px 行高基线排布,与右侧块级 el-select 竖直错位("歪")。
        // 这里重置行高,让各控件按 flex-end 正常对齐。
        :deep(.el-form-item__content) {
          line-height: normal;
        }

        // 全局表单样式会让错误提示参与横向 flex 布局，导致文案显示在输入框右侧。
        // 恢复 Element Plus 的定位方式，使提示固定显示在控件下方且不挤动工具栏。
        :deep(.el-form-item__error) {
          position: absolute;
          top: 100%;
          left: 0;
        }

        // 输入框统一 30px 标准控件高度,与 select / 按钮底部对齐
        :deep(.el-form-item__content .inline-input),
        :deep(.el-form-item__content .inline-input .el-input__wrapper) {
          height: 30px;
          min-height: 30px;
        }

        :deep(.el-form-item__content .inline-input .el-input__inner) {
          min-width: 130px;
          height: 28px;
          line-height: 28px;
        }

        // 执行、停止按钮:图标 + 文字,30px,与输入框/下拉等高
        :deep(.el-form-item__content .start-stop-btn) {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 30px;
        }

        // 账号策略 / 模块 / 超时:标准 el-select(30px、原生下拉),替换旧的灰色假按钮
        :deep(.el-form-item__content .toolbar-select) {
          width: 130px;

          .el-select__wrapper {
            min-height: 30px;
            height: 30px;
          }
        }

        // 必填项(运行用户)此前用 -1px 负 margin 微调,导致与其它字段错位(看起来"歪");
        // 统一为 0,与相邻 select/输入框底部对齐。
        &.is-required {
          margin-bottom: 0;
        }
      }

      .fold {
        display: flex;
        align-items: center;
        justify-content: center;
        // 撑到与控件等高(30px),底部对齐后图标即与右侧 select/输入框竖直居中对齐
        height: 30px;
        margin-left: 15px;

        &.sepcial-icon {
          margin-top: 5px;
          margin-left: 0 !important;
        }

        i {
          font-weight: bold;
          font-size: 15px;
          cursor: pointer;
        }
      }
    }

    .right-side {
      display: flex;
      flex: 1;
      width: 90px;

      .el-button {
        border: none;
        padding: 5px;
        font-size: 14px;
        width: 30px;
        height: 30px;
        background: none;

        &:hover {
          color: var(--color-text-primary);
          background-color: var(--color-border);
        }
      }
    }
  }

  .editor {
    overflow: hidden;
    border-radius: 4px;

    :deep(.cm-editor) {
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: #fff;
    }

    // 去掉 CodeMirror 聚焦时的默认虚线 outline(CM6 默认 outline:1px dotted)
    :deep(.cm-editor.cm-focused) {
      outline: none;
    }

    :deep(.cm-gutters) {
      background: #fff;
      border-right: 1px solid var(--color-border);
      color: var(--color-text-secondary);
    }

    :deep(.cm-scroller) {
      overflow: auto;
    }

    :deep(.cm-content),
    :deep(.cm-line) {
      cursor: text;
      user-select: text;
      -webkit-user-select: text;
    }

    :deep(.cm-activeLine) {
      background: transparent;
    }

    :deep(.cm-activeLineGutter) {
      background: var(--color-disabled-background);
    }
  }
}

:deep(.cm-line) {
  line-height: 18px;
}

.autoWidth-select {
  min-width: 100px;
}

.autoWidth-select :deep(.el-input__prefix) {
  position: relative;
  left: 0;
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  visibility: hidden;
}

.autoWidth-select :deep(input) {
  position: absolute;
  padding-left: 0px;
  border: none;
  color: var(--color-text-primary);
  background-color: var(--color-border);
  font-size: 12px;
  font-weight: 470;
  line-height: 27px;
}

:deep(.el-select) {
  top: -1px;

  .el-input .el-select__caret {
    color: var(--color-text-secondary);
  }
}

.filter-label {
  font-size: 12px;
  font-weight: 700;
}
</style>
