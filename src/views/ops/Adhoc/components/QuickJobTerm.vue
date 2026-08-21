<template>
  <div class="term-wrapper">
    <div class="term-header">
      <div class="header-text">{{ $tc('Output') }}</div>
      <div v-if="executionInfo.status" class="header-status">
        <span class="status-item">
          <el-link @click="viewConfirmRunAssets">
            <span>{{ selectAssets.length }}</span>
          </el-link>
          <span style="display: inline-block" @click="viewConfirmRunAssets">
            {{ $t('AssetsSelected') }}
          </span>
        </span>
        <span class="status-item">
          <span>{{ $tc('Status') }}: </span>
          <span
            :class="{
              status_success: executionInfo.status.value === 'success',
              status_warning: executionInfo.status.value === 'timeout',
              status_danger: executionInfo.status.value === 'failed'
            }"
            >{{ $tc('' + executionInfo.status.label) }}</span
          >
        </span>
        <span class="status-item">
          <span>{{ $tc('TimeDelta') }}: </span>
          <span>{{ executionInfo.timeCost }}s</span>
        </span>
      </div>
      <div v-if="showToolBar" class="actions">
        <div v-for="(item, index) in toolbar" :key="index" class="action-item">
          <el-tooltip
            v-if="!item.isScrollButton || showScrollButton"
            :content="item.tip"
            :show-after="500"
          >
            <el-button size="small" type="primary" @click="item.callback()">
              <svg-icon :icon-class="item.icon" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div id="terminal" ref="terminal" class="xterm" />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import { downloadText } from '@/utils/common/index'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'
import { colorToRgba, getCssVar } from '@/utils/theme/color'

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
      default: () => {}
    },
    executionInfo: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {}
    },
    selectAssets: {
      type: Array,
      default: () => []
    }
  },
  data() {
    const selectionColor = colorToRgba(getCssVar('--color-text-primary'), 0.18)
    return {
      xterm: markRaw(
        new Terminal(
          Object.assign(
            {
              fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
              lineHeight: 1.2,
              fontSize: 13,
              scrollback: 9999999,
              rightClickSelectsWord: true,
              theme: {
                background: '#fff',
                foreground: '#000',
                selectionBackground: selectionColor,
                selectionInactiveBackground: selectionColor
              }
            },
            this.xtermConfig
          )
        )
      ),
      toolbar: [
        {
          tip: this.$tc('ScrollToTop'),
          icon: 'arrow-up',
          callback: this.scrollToTop,
          isScrollButton: true
        },
        {
          tip: this.$tc('ScrollToBottom'),
          icon: 'arrow-down',
          callback: this.scrollToBottom,
          isScrollButton: true
        },
        {
          tip: this.$tc('ClearScreen'),
          icon: 'refresh',
          callback: () => {
            this.xterm.reset()
          }
        },
        {
          tip: this.$tc('Export'),
          icon: 'download',
          callback: () => {
            this.xterm.selectAll()
            const text = this.xterm.getSelection()
            const filename = `${this.xtermConfig?.type}_${this.xtermConfig?.taskId}.log`
            downloadText(text, filename)
          }
        }
      ],
      showScrollButton: false
    }
  },
  mounted: function () {
    const terminalContainer = this.$refs.terminal
    const fitAddon = new FitAddon()
    this.xterm.loadAddon(fitAddon)
    this.xterm.open(terminalContainer)
    fitAddon.fit()
    this.xterm.scrollToBottom()
    this.xterm.onScroll(this.checkScroll)
  },
  beforeUnmount() {
    this.xterm.dispose()
  },
  methods: {
    reset: function () {
      this.xterm.reset()
    },
    write: function (val) {
      this.xterm.write(val)
    },
    checkScroll(position) {
      this.showScrollButton = position > 0
    },
    scrollToTop() {
      // 不能改，只有这么写才能保证上箭头和下箭头不消失
      this.$nextTick(() => {
        this.xterm.scrollToTop()
      })
      setTimeout(() => {
        this.showScrollButton = true
      })
    },
    scrollToBottom() {
      setTimeout(() => {
        this.showScrollButton = true
        this.xterm.scrollToBottom()
      })
    },
    viewConfirmRunAssets() {
      this.$emit('view-assets')
    }
  }
}
</script>

<style scoped lang="scss">
.term-wrapper {
  position: relative;

  .term-header {
    display: flex;
    align-items: center;
    height: 45px;
    padding: 0 10px 0 15px;
    background-color: var(--color-disabled-background);

    .header-text {
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 1px;
    }

    .header-status {
      margin-left: 10px;
      font-weight: 400;

      .status-item {
        letter-spacing: 0.5px;
        padding-left: 25px;

        .status_success {
          color: var(--color-primary);
        }

        .status_warning {
          color: var(--color-warning);
        }

        .status_danger {
          color: var(--color-danger);
        }
      }
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      margin-left: auto;

      .action-item {
        display: flex;
        align-items: center;

        :deep(.el-button > span) {
          color: inherit;
        }

        .el-button {
          border: none;
          padding: 2px;
          font-size: 14px;
          width: 26px;
          height: 26px;
          margin-left: 2px;
          color: var(--color-icon-primary);
          background-color: transparent;

          &:hover,
          &:focus {
            background-color: var(--color-border) !important;
            color: var(--color-text-primary);
          }
        }
      }
    }
  }

  .xterm {
    overflow: auto;
    padding: 10px 0 0 20px;
    background-color: #fff;
  }
}
</style>
