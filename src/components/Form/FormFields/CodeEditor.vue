<template>
  <div class="code-editor" style="font-size: 12px">
    <el-form ref="form" :model="formModel" :rules="rules" label-position="top" label-width="80px">
      <div class="form-content">
        <el-form-item
          v-for="(item, index) in iActions"
          :key="index"
          :label="item.name"
          :prop="item.name"
        >

          <template v-if="item.type === 'button' && !item.isVisible">
            <el-tooltip :disabled="!item.tip" :content="item.tip">
              <el-button
                :type="item.el && item.el.type"
                class="start-stop-btn"
                size="mini"
                @click="item.callback()"
              >
                <i :class="item.icon" />

                {{ item.name }}
              </el-button>
            </el-tooltip>
          </template>

          <template v-if="item.type === 'input' && item.el && item.el.autoComplete">
            <el-tooltip :disabled="!item.tip" :content="item.tip">
              <el-autocomplete
                v-model="formModel[item.name]"
                :fetch-suggestions="item.el.query"
                :placeholder="item.placeholder"
                class="inline-input"
                size="mini"
                clearable
                @change="handleInputChange(item)"
                @select="handleInputChange(item)"
              />
            </el-tooltip>
          </template>

          <template v-else-if="item.type === 'input'">
            <el-tooltip :disabled="!item.tip" :content="item.tip">
              <el-input
                v-model="formModel[item.name]"
                :class="!isFold ? 'special-style' : ''"
                :placeholder="item.placeholder"
                class="inline-input"
                size="mini"
                @change="item.callback(formModel[item.name])"
              />
            </el-tooltip>
          </template>

          <template v-if="item.type === 'select' && item.el && item.el.create">
            <el-tooltip :disabled="!item.tip" :content="item.tip">
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
                size="mini"
                @change="item.callback(item.value)"
              >
                <template slot="prefix">{{ item.label + ':' + item.value }}</template>
                <el-option
                  v-for="(option, id) in item.options"
                  :key="id"
                  :label="option.label"
                  :title="option.value"
                  :value="option.value"
                />
              </el-select>
            </el-tooltip>
          </template>

          <template v-if="item.type === 'select' && (!item.el || !item.el.create)">
            <el-tooltip :disabled="!item.tip" :content="item.tip">
              <el-dropdown
                class="select-dropdown"
                trigger="click"
                @command="(command) => {
                  item.value = command
                  item.callback(command)
                }"
              >
                <el-button size="mini" type="primary">
                  <div class="text-content">
                    <span class="content">
                      {{ getLabel(item.value, item.options) }}
                      <i class="el-icon-arrow-down el-icon--right" />
                    </span>
                  </div>
                </el-button>
                <el-dropdown-menu v-slot="dropdown">
                  <el-dropdown-item
                    v-for="(option, i) in item.options"
                    :key="i"
                    :command="option.value"
                  >
                    {{ option.label }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
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
        <div
          v-if="toolbar.hasOwnProperty('fold')"
          :class="!isFold ? 'sepcial-icon' : ''"
          class="fold"
        >
          <el-tooltip :content="$tc('MoreActions')" :open-delay="500" placement="top">
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
          <el-tooltip :content="item.tip" :open-delay="500">
            <el-button
              v-if="item.type === 'button'"
              :disabled="item.disabled"
              size="mini"
              type="default"
              @click="item.callback()"
            >
              <i v-if="item.icon.startsWith('fa')" :class="'fa ' + item.icon" />
              <svg-icon v-else :icon-class="item.icon" style="font-size: 14px;" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </el-form>
    <codemirror
      ref="myCm"
      v-model="iValue"
      :options="iOptions"
      class="editor"
      :style="iActions.length > 0 ? { marginLeft: '30px' } : {}"
    />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'

import 'codemirror/mode/shell/shell'
import 'codemirror/mode/powershell/powershell'
import 'codemirror/mode/python/python'
import 'codemirror/mode/yaml/yaml'
import 'codemirror/mode/ruby/ruby' // theme css
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/idea.css'
import 'codemirror/theme/mbo.css'
import 'codemirror/theme/duotone-light.css'
import 'codemirror/lib/codemirror.css'

export default {
  components: {
    codemirror
  },
  props: {
    toolbar: {
      type: [Array, Object],
      default: () => []
    },
    value: {
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

      actions.forEach(action => {
        if (!this.formModel.hasOwnProperty(action.name)) {
          this.$set(this.formModel, action.name, action.value || '')
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

      Object.values(actionsObj).forEach(action => {
        if (action.name === this.$t('RunAs') && action.type === 'input') {
          rules[action.name] = [{ required: true, message: this.$t('RequiredRunas'), trigger: 'blur' }]
        }
      })

      return rules
    },
    iValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('update:value', val)
        this.$emit('input', val)
      }
    },
    iOptions() {
      const defaultOptions = {
        tabSize: 4,
        mode: 'shell',
        lineNumbers: true,
        theme: 'idea',
        placeholder: 'Code goes here...',
        autofocus: true
      }
      return Object.assign(defaultOptions, this.options)
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
$header-bg-color: #F5F6F7;
$input-border-color: #C0C4CC;

.code-editor {
  display: flex;
  flex-direction: column;

  .el-form {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    margin-left: 30px;
    margin-bottom: 20px;

    .form-content {
      display: flex;
      flex: 12;

      .el-form-item {
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        margin-bottom: 0;
        margin-right: 5px;

        // input 框与 label 相关样式
        ::v-deep .el-form-item__label {
          display: flex;
          justify-items: flex-start;
          align-items: center;
          height: 20px;
          padding-bottom: 5px !important;
          color: var(--color-text-secondary);
          font-weight: 700;
          font-size: 11px;
        }

        ::v-deep .el-form-item__content .inline-input .el-input__inner {
          //width: 130px;
          min-width: 130px;
        }

        // 执行、暂停按钮
        ::v-deep .el-form-item__content .start-stop-btn {
          display: flex;
          align-items: center;
          height: 28px;
          margin-bottom: 1.5px;
        }

        ::v-deep .el-form-item__content .select-dropdown .el-button {
          width: 125px;
          background-color: $header-bg-color;
          border-color: $input-border-color;

          &:focus,
          &:hover {
            border-color: $input-border-color !important;
            background-color: $header-bg-color !important;
          }

          .text-content {
            color: var(--color-text-primary);

            .content {
              display: flex;
              justify-content: space-between;
            }
          ;
          }
        }

        &.is-required {
          margin-bottom: -1px;
        }
      }

      .fold {
        display: flex;
        align-items: center;
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
      //margin-right: 10px;

      .el-button {
        border: none;
        padding: 5px;
        font-size: 14px;
        width: 28px;
        height: 28px;
        background: none;

        &:hover {
          color: var(--color-text-primary);
          background-color: #e6e6e6;
        }
      }
    }
  }

  .editor {
    border: 1px solid var(--color-border);
    overflow: hidden;
  }
}

::v-deep .CodeMirror pre.CodeMirror-line,
::v-deep .CodeMirror-linenumber.CodeMirror-gutter-elt {
  line-height: 18px !important;
}

.runas-input {
  height: 28px;

  ::v-deep {
    .el-select {
      width: 100px;
    }
  }
}

.autoWidth-select {
  min-width: 100px;
}

.autoWidth-select ::v-deep .el-input__prefix {
  position: relative;
  left: 0;
  box-sizing: border-box;
  height: 30px;
  line-height: 30px;
  visibility: hidden;
}

.autoWidth-select ::v-deep input {
  position: absolute;
  padding-left: 0px;
  border: none;
  color: #606266;
  background-color: #e6e6e6;
  font-size: 12px;
  font-weight: 470;
  line-height: 27px;
}

::v-deep .el-select {
  top: -1px;

  .el-input .el-select__caret {
    color: #7a7c7f;
  }
}

.filter-label {
  font-size: 12px;
  font-weight: 700;
}

.select-content {
  display: inline-block;
  position: relative;
  top: 1px;
  height: 28px;
  line-height: 28px;
  padding-left: 15px;
  font-size: 0;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  background-color: #e6e6e6;
}
</style>
