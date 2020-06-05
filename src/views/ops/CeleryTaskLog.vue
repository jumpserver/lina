<template>
  <div id="terminal" ref="terminal" class="xterm" style="height: 100%;width: 100%;background-color:#676a6c" />
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
export default {
  name: 'CeleryTaskLog',
  data() {
    return {
      xterm: null,
      ws: null,
      taskId: this.$route.params.id,
      url: '/ws/ops/tasks/log/',
      failOverPort: process.env.VUE_APP_WS_PORT
    }
  },
  computed: {
    scheme() {
      return document.location.protocol === 'https:' ? 'wss' : 'ws'
    },
    port() {
      return document.location.port ? ':' + document.location.port : ''
    },
    wsURL() {
      return this.scheme + '://' + document.location.hostname + this.port + this.url
    },
    failOverWsURL() {
      return this.scheme + '://' + document.location.hostname + ':' + this.failOverPort + this.url
    }
  },
  mounted() {
    this.initTerm()
    this.webSocket()
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
    initTerm: function() {
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
    webSocket: function() {
      this.ws = new WebSocket(this.wsURL)
      this.ws.onmessage = this.onMessage()
      this.ws.onopen = this.onOpen()
      this.ws.onerror = this.onError()
    },
    onMessage: function(e) {
      const data = JSON.parse(e.data)
      this.xterm.write(data)
    },
    onOpen: function() {
      const msg = { 'task': this.taskId }
      this.ws.send(JSON.stringify(msg))
    },
    onError: function(e) {
      this.ws = new WebSocket(this.failOverWsURL)
      this.ws.onmessage = this.onMessage()
      this.ws.onerror = function(e) {
        this.xterm.write('Connect websocket server error')
      }
    }
  }
}
</script>

<style scoped>

</style>
