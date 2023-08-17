<template>
  <div id="terminal" ref="terminal" class="xterm" />
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
export default {
  name: 'CeleryTaskLog',
  props: {
  },
  data() {
    return {
      xterm: null,
      ws: null,
      taskId: this.$route.params.id,
      type: this.$route.params.type || this.$route.query.type || 'celery',
      url: '/ws/ops/tasks/log/',
      failOverPort: process.env.VUE_APP_WS_PORT
    }
  },
  computed: {
  },
  mounted() {
    this.initTermAndWs()
  },
  beforeDestroy() {
    this.xterm.dispose()
  },
  methods: {
    reset() {
      this.xterm.reset()
    },
    write(val) {
      this.xterm.write(val)
    },
    initTermAndWs() {
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
      window.onresize = function() {
        fitAddon.fit()
      }
      this.xterm.scrollToBottom()
      this.enableWS()
    },
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/ops/tasks/log/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      // const failOverPort = '8070'
      // const failOverWsURL = scheme + '://' + document.location.hostname + ':' + failOverPort + url
      this.ws = new WebSocket(wsURL)
      this.ws.onerror = (e) => {
        this.xterm.write(this.wrapperError('Connect websocket server error'))
      }
      this.setWsCallback()
    },
    setWsCallback() {
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        this.xterm.write(data.message)
      }
      this.ws.onopen = (e) => {
        const msg = { 'task': this.taskId, 'type': this.type }
        this.ws.send(JSON.stringify(msg))
      }
    },
    wrapperError(msg) {
      return `\r\n${msg}\r\n`
    }
  }
}
</script>

<style scoped>
#terminal {
  height: 100%;
  width: 100%;
  background-color: #1f1b1b;
  padding: 10px
}
#terminal.xterm {
  height: 100vh;
}
</style>
