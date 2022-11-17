<template>
  <div style="font-size: 12px">
    <div
      v-if="toolbar.length>0"
      style="height: 100%;width: 100%;vertical-align: middle;display: inline-block;background-color: #1ab394"
    >
      <template v-for="(item,index) in toolbar">
        <el-tooltip :key="index" :content="item.tip" placement="top">
          <el-button v-if="item.type==='button'" size="mini" type="primary" @click="item.callback">
            <i :class="item.icon" />
          </el-button>
        </el-tooltip>
      </template>
    </div>
    <codemirror ref="myCm" v-model="iValue" :options="cmOptions" />
  </div>
</template>

<script>

import { codemirror } from 'vue-codemirror'

import 'codemirror/mode/shell/shell'
import 'codemirror/mode/powershell/powershell'
import 'codemirror/mode/python/python'
import 'codemirror/mode/ruby/ruby'

// theme css
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
          theme: 'base16-dark',
          lineNumbers: true,
          line: true
        }
      }
    }
  },
  data() {
    return {}
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

<style scoped>

</style>
