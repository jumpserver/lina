<template>
  <div id="terminal" ref="terminal" class="xterm" />
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
export default {
  name: 'Term',
  data() {
    return {
      xterm: ''
    }
  },
  mounted: function() {
    const terminalContainer = this.$refs.terminal
    this.xterm = new Terminal(
      {
        fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
        lineHeight: 1.2,
        fontSize: 13,
        rightClickSelectsWord: true,
        theme: {
          background: '#1f1b1b'
        }
      })
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
    },
    changeSelectedAssets() {
    }
  }

}

</script>
