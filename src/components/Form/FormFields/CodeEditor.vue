<template>
  <div class="code-editor" style="font-size: 12px">
    <div class="toolbar">
      <div
        v-for="(item,index) in iActions"
        :key="index"
        style="display: inline-block; margin: 0 2px"
      >
        <el-tooltip :content="item.tip" :disabled="!item.tip" placement="top">
          <el-button
            v-if="item.type ==='button'"
            :disabled="item.disabled"
            :type="item.el&&item.el.type"
            size="mini"
            @click="item.callback()"
          >
            <i :class="item.icon" style="margin-right: 4px;" />{{ item.name }}
          </el-button>
          <el-autocomplete
            v-if="item.type === 'input' &&item.el && item.el.autoComplete"
            v-model="item.value"
            :placeholder="item.placeholder"
            :fetch-suggestions="item.el.query"
            class="inline-input"
            size="mini"
            @select="item.callback(item.value)"
            @change="item.callback(item.value)"
          />
          <el-input
            v-else-if="item.type==='input'"
            v-model="item.value"
            :placeholder="item.placeholder"
            class="inline-input"
            size="mini"
            @change="item.callback(item.value)"
          />
          <div v-if="item.type==='select' && item.el && item.el.create" class="select-content">
            <span class="filter-label">
              {{ item.name }}:
            </span>
            <el-select
              v-if="item.type==='select' && item.el && item.el.create"
              :key="index"
              v-model="item.value"
              :allow-create="item.el.create || false"
              :filterable="item.el.create || false"
              :multiple="item.el.multiple"
              :placeholder="item.name"
              class="autoWidth-select"
              default-first-option
              size="mini"
              @change="item.callback(item.value)"
            >
              <template slot="prefix">
                {{ item.label + ':' + item.value }}
              </template>
              <el-option
                v-for="(option,id) in item.options"
                :key="id"
                :label="option.label"
                :title="option.value"
                :value="option.value"
              />
            </el-select>
          </div>
          <el-dropdown
            v-if="item.type==='select' && (!item.el || !item.el.create) "
            trigger="click"
            @command="(command) => {
              item.value= command
              item.callback(command)
            }"
          >
            <el-button size="mini" type="default">
              <b>{{ item.name }}:</b> {{ getLabel(item.value, item.options) }} <i
                class="el-icon-arrow-down el-icon--right"
              />
            </el-button>
            <el-dropdown-menu v-slot="dropdown">
              <el-dropdown-item v-for="(option,i) in item.options" :key="i" :command="option.value">
                {{ option.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-switch
            v-if="item.type === 'switch'"
            v-model="item.value"
            :active-text="item.name"
            :disabled="item.disabled"
            @change="item.callback( item.value)"
          />
        </el-tooltip>
      </div>

      <div v-if="toolbar.hasOwnProperty('fold')" class="fold">
        <el-tooltip :content="$tc('common.MoreActions')" placement="top">
          <i
            class="fa"
            :class="[isFold ? 'fa-angle-double-right': 'fa-angle-double-down']"
            @click="onChangeFold"
          />
        </el-tooltip>
      </div>

      <div class="right-side" style="float: right">
        <div
          v-for="(item,index) in toolbar.right"
          :key="index"
          style="display: inline-block"
        >
          <el-tooltip :content="item.tip">
            <el-button
              v-if="item.type ==='button'"
              :disabled="item.disabled"
              size="mini"
              style="background-color: transparent"
              type="default"
              @click="item.callback()"
            >
              <i v-if="item.icon.startsWith('fa')" :class="'fa ' + item.icon" />
              <svg-icon v-else :icon-class="item.icon" style="font-size: 14px;" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <codemirror ref="myCm" v-model="iValue" :options="iOptions" class="editor" />
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
      isFold: true
    }
  },
  computed: {
    iActions() {
      let actions = this.toolbar.left || {}
      const fold = this.toolbar.fold || {}
      if (!this.isFold) {
        actions = { ...actions, ...fold }
      }
      return actions
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
    }
  }
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
  padding: 3px 3px 3px 0;
  margin-bottom: 5px;
}

.fold {
  display: inline-block;
  padding-left: 4px;
  i {
    font-weight: bold;
    font-size: 15px;
    cursor: pointer;
  }
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
