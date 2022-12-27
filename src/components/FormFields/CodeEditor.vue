<template>
  <div style="font-size: 12px" class="code-editor">
    <div class="toolbar">
      <div
        v-for="(item,index) in leftToolbar"
        :key="index"
        style="display: inline-block; margin: 0 2px"
      >
        <el-tooltip :content="item.tip" placement="top" :disabled="!item.tip">
          <el-button
            v-if="item.type ==='button'"
            size="mini"
            :type="item.el&&item.el.type"
            :disabled="item.disabled"
            @click="item.callback(iValue, iOptions)"
          >
            <i :class="item.icon" style="margin-right: 4px;" />{{ item.name }}
          </el-button>

          <div v-if="item.type==='select' && item.el && item.el.create" class="select-content">
            <span class="filter-label">
              {{ item.name }}:
            </span>
            <el-select
              v-if="item.type==='select' && item.el && item.el.create"
              :key="index"
              v-model="item.value"
              class="autoWidth-select"
              size="mini"
              default-first-option
              :multiple="item.el.multiple"
              :allow-create="item.el.create"
              :filterable="item.el.create && filterLabel(item).indexOf($tc('ops.ManualInput')) > -1"
              :placeholder="item.name"
              @change="item.callback(iValue, iOptions, item.value)"
            >
              <template slot="prefix">
                {{ item.label + ':' + item.value }}
              </template>
              <el-option
                v-for="(option,id) in item.options"
                :key="id"
                :label="option.label"
                :value="option.value"
                :title="option.value"
              />
            </el-select>
          </div>
          <el-dropdown
            v-if="item.type==='select' && (!item.el || !item.el.create) "
            trigger="click"
            @command="(command) => {
              item.value= command
              item.callback(iValue, iOptions, command)
            }"
          >
            <el-button type="default" size="mini">
              <b>{{ item.name }}:</b> {{ item.value }} <i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(option,i) in item.options" :key="i" :command="option.value">
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-switch
            v-if="item.type === 'switch'"
            v-model="item.value"
            :disabled="item.disabled"
            :active-text="item.name"
            @change="item.callback(iValue, iOptions, item.value)"
          />
        </el-tooltip>
      </div>

      <div style="float: right" class="right-side">
        <div
          v-for="(item,index) in rightToolbar"
          :key="index"
          style="display: inline-block"
        >
          <el-tooltip :content="item.tip">
            <el-button
              v-if="item.type ==='button'"
              size="mini"
              type="default"
              :disabled="item.disabled"
              @click="item.callback(iValue,iOptions)"
            >
              <i v-if="item.icon.startsWith('fa')" :class="'fa ' + item.icon" />
              <svg-icon v-else :icon-class="item.icon" style="font-size: 14px;" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <codemirror ref="myCm" v-model="iValue" class="editor" :options="iOptions" />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'

import 'codemirror/mode/shell/shell'
import 'codemirror/mode/powershell/powershell'
import 'codemirror/mode/python/python'
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
      type: Array,
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
      runas: '',
      runasPolicy: 'skip',
      lang: 'shell'
    }
  },
  computed: {
    filterLabel() {
      return (item) => {
        const select = item.options.find(i => i.value === item.value) || {}
        const label = (Object.keys(select).length > 0 ? select.label : this.$t('ops.ManualInput')) + ':'
        return label
      }
    },
    isManual() {
      return () => {
      }
    },
    rightToolbar() {
      return this.toolbar.filter((item) => {
        return item.align === 'right'
      })
    },
    leftToolbar() {
      return this.toolbar.filter((item) => {
        return item.align === 'left'
      })
    },
    iValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('update:value', val)
        this.$emit('change', val)
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
  methods: {}
}
</script>

<style lang="scss" scoped>
.editor {
  border: solid 1px #f3f3f3;
}

.toolbar {
  height: 100%;
  width: 100%;
  line-height: 29px;
  vertical-align: bottom;
  display: inline-block;
  padding: 3px;
  margin-bottom: 5px;
}

> > > .CodeMirror pre.CodeMirror-line,
> > > .CodeMirror-linenumber.CodeMirror-gutter-elt {
  line-height: 18px !important;
}

.runas-input {
  height: 28px;

  > > > {
    .el-select {
      width: 100px;
    }
  }
}

.right-side {
  .el-button {
    border: none;
    padding: 2px;
    font-size: 14px;
    width: 26px;
    height: 26px;
    color: #888;
    background-color: transparent;
    margin-left: 2px;
  }
}

.autoWidth-select {
  min-width: 100px;
}

.autoWidth-select > > > .el-input__prefix {
  position: relative;
  left: 0px;
  box-sizing: border-box;
  padding-left: 15px;
  margin-right: 30px;
  height: 28px;
  line-height: 28px;
  visibility: hidden;
}

.autoWidth-select > > > input {
  position: absolute;
  padding-left: 0px;
  border: none;
  color: #606266;
  background-color: #e6e6e6;
  font-size: 12px;
  font-weight: 470;
  line-height: 27px;
}

> > > .el-select {
  top: -1px;

  .el-input .el-select__caret {
    color: #7a7c7f;
  }
}

> > > .el-button.el-button--default {
  background-color: #e6e6e6;
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
