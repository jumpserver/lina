
<template>
  <div id="terminal" ref="terminal" class="xterm" />
</template>

<script>
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
const spinChars = ['|', '/', '-', '\\']
export default {
  name: 'ComponentLogTail',
  data() {
    return {
      xterm: null,
      ws: null,
      currentIndex: 0,
      intervalSpin: null
    }
  },
  mounted() {
    this.initTermAndWs()
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
          cursorBlink: false,
          screenKeys: false,
          fontFamily: '"Monaco", "Consolas", "monospace"',
          fontSize: 13,
          lineHeight: 1.2,
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
      const url = '/ws/component-log-tail/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
      this.ws.onerror = (e) => {
        this.xterm.write(this.wrapperError('Connect websocket server error'))
        clearInterval(this.intervalSpin)
      }
      this.setWsCallback()
    },
    setWsCallback() {
      this.intervalSpin = setInterval(this.displaySpin, 200)
      this.ws.onmessage = (e) => {
        clearInterval(this.intervalSpin)
        this.cleanSpinChar()
        const data = JSON.parse(e.data)
        const streams = data.streams
        for (let i = 0; i < streams.length; i++) {
          const stream = streams[i]
          this.xterm.writeln(stream['values'][0][1])
        }
        this.intervalSpin = setInterval(this.displaySpin, 200)
      }
      this.ws.onopen = (e) => {
        const components = this.$route.query.components
        const search = this.$route.query.search
        const msg = { 'components': components, 'search': search }
        this.ws.send(JSON.stringify(msg))
      }
    },
    wrapperError(msg) {
      return `\r\n${msg}\r\n`
    },
    displaySpin() {
      this.xterm.write('\r' + spinChars[this.currentIndex])
      this.currentIndex = (this.currentIndex + 1) % spinChars.length
    },
    cleanSpinChar() {
      this.xterm.write('\r')
    }
  }
}
</script>

<style scoped>
#terminal {
  height: 100%;
  width: 100%;
  background-color: #1f1b1b;
  padding:5px
}
#terminal.xterm {
  height: 100vh;
}
</style>
