<template>
  <div style="font-size: 12px" class="code-editor">
    <div class="toolbar">
      <div
        v-for="(item,index) in leftToolbar"
        :key="index"
        style="display: inline-block;margin: 0 2px"
      >
        <el-tooltip :content="item.tip" placement="top" :disabled="!item.tip">

          <el-button
            v-if="item.type ==='button'"
            size="mini"
            :type="item.el&&item.el.type"
            @click="item.callback(iValue,cmOptions)"
          >
            <i :class="item.icon" />{{ item.name }}
          </el-button>

          <el-select
            v-if="item.type==='select' && item.el && item.el.multiple"
            v-model="item.value"
            size="mini"
            multiple
            :allow-create="item.el.create"
            :filterable="item.el.create"
            :placeholder="item.name"
            @change="item.callback(iValue,cmOptions,item.value)"
          >
            <el-option
              v-for="(option,id) in item.options"
              :key="id"
              :label="option.label"
              :value="option.value"
            />
          </el-select>

          <el-dropdown
            v-if="item.type==='select' && (!item.el || !item.el.multiple) "
            trigger="click"
            @command="(command) => {
              item.value= command
              item.callback(iValue,cmOptions,command)
            }"
          >
            <el-button type="default" size="mini">
              <b>{{ item.name }}</b> {{ item.value }} <i class="el-icon-arrow-down el-icon--right" />
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
            :active-text="item.name"
            @change="item.callback(iValue,cmOptions,item.value)"
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
            <el-button v-if="item.type ==='button'" size="mini" type="default" @click="item.callback(iValue,cmOptions)">
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
</style>
