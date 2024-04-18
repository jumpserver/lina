<template>
  <div style="position: relative;">
    <div v-if="showToolBar" class="actions">
      <div
        v-for="(item,index) in toolbar"
        :key="index"
        style="display: inline-block"
      >
        <el-tooltip :content="item.tip">
          <el-button
            size="mini"
            type="default"
            @click="item.callback()"
          >
            <svg-icon :icon-class="item.icon" />
          </el-button>
        </el-tooltip>
      </div>
    </div>
    <div id="terminal" ref="terminal" class="xterm" />
  </div>
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { downloadText } from '@/utils/common'

export default {
  name: 'Term',
  props: {
    showToolBar: {
      type: [Boolean, Object],
      default: () => {
        return false
      }
    },
    xtermConfig: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      xterm: new Terminal(Object.assign({
        fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
        lineHeight: 1.2,
        fontSize: 13,
        rightClickSelectsWord: true,
        theme: {
          background: '#fff',
          foreground: '#000',
          selection: '#363535'
        }
      }, this.xtermConfig)),
      toolbar: [
        {
          tip: this.$tc('ops.ScrollToTop'),
          icon: 'arrow-up',
          callback: () => {
            this.xterm.scrollToTop()
          }
        },
        {
          tip: this.$tc('ops.ScrollToBottom'),
          icon: 'arrow-down',
          callback: () => {
            this.xterm.scrollToBottom()
          }
        },
        {
          tip: this.$tc('ops.ClearScreen'),
          icon: 'refresh',
          callback: () => {
            this.xterm.reset()
          }
        },
        {
          tip: this.$tc('common.Export'),
          icon: 'download',
          callback: () => {
            this.xterm.selectAll()
            const text = this.xterm.getSelection()
            const filename = `shortcut_cmd_${this.$route.query?.taskId}.log`
            downloadText(text, filename)
          }
        }
      ]
    }
  },
  mounted: function() {
    const terminalContainer = this.$refs.terminal
    const fitAddon = new FitAddon()
    this.xterm.loadAddon(fitAddon)
    this.xterm.open(terminalContainer)
    fitAddon.fit()
    this.xterm.scrollToBottom()
  },
  beforeDestroy() {
    this.xterm.dispose()
  },
  methods: {
    reset: function() {
      this.xterm.reset()
    },
    write: function(val) {
      this.xterm.write(val)
    }
  }
}

</script>

<style scoped>
.xterm {
  padding-left: 5px;
  background-color: #FFFFFF;
}

.actions {
  text-align: right;
  background-color: #FFF;
  padding-right: 5px;
  padding-top: 2px
}

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
</style>
