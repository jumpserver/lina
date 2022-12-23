<template>
  <div style="font-size: 12px" class="code-editor">
    <div class="toolbar">
      <el-button size="mini" type="primary">
        <i class="fa fa-play" /> 执行
      </el-button>

      <el-dropdown trigger="click">
        <el-button type="default" size="mini">
          <b>账号:</b> web <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>优先特权账号</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button type="default" size="mini">
          <b>账号策略:</b> 跳过 <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>跳过</el-dropdown-item>
          <el-dropdown-item>仅特权账号</el-dropdown-item>
          <el-dropdown-item>优先特权账号</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown trigger="click">
        <el-button type="default" size="mini">
          语言: Shell <i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item value="shell">Shell</el-dropdown-item>
          <el-dropdown-item value="python">Python</el-dropdown-item>
          <el-dropdown-item>Powershell</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <div style="float: right" class="right-side">
        <el-button size="mini" type="default">
          <i class="fa fa-upload" />
        </el-button>
        <el-button size="mini" type="default">
          <i class="fa fa-folder-open" />
        </el-button>
        <el-button size="mini" type="default">
          <svg-icon icon-class="save" style="font-size: 14px;" />
        </el-button>
      </div>
    </div>
    <codemirror ref="myCm" v-model="iValue" class="editor" :options="cmOptions" />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror'

import 'codemirror/mode/shell/shell'
import 'codemirror/mode/powershell/powershell'
import 'codemirror/mode/python/python'
import 'codemirror/mode/ruby/ruby' // theme css
import 'codemirror/theme/base16-dark.css'
import 'codemirror/theme/base16-light.css'
import 'codemirror/theme/idea.css'
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
    cmOptions: {
      type: Object,
      default: () => {
        return {
          tabSize: 4,
          mode: 'shell',
          lineNumbers: true,
          line: true
        }
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
    iValue: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('update:value', val)
        this.$emit('change', val)
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
  padding: 3px;
  margin-bottom: 5px;
}
>>> .CodeMirror pre.CodeMirror-line,
>>> .CodeMirror-linenumber.CodeMirror-gutter-elt {
  line-height: 18px !important;
}
.runas-input {
  height: 28px;
  >>> {
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
