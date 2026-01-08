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
          >{{ $tc('' + executionInfo.status.label) }}</span>
        </span>
        <span class="status-item">
          <span>{{ $tc('TimeDelta') }}: </span>
          <span>{{ executionInfo.timeCost }}s</span>
        </span>
      </div>
      <div v-if="showToolBar" class="actions">
        <div v-for="(item, index) in toolbar" :key="index" class="action-item">
          <el-tooltip :content="item.tip" :open-delay="500">
            <el-button
              v-if="!item.isScrollButton || showScrollButton"
              size="small"
              type="primary"
              @click="item.callback()"
            >
              <svg-icon :icon-class="item.icon" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>
    <div id="terminal" ref="terminal" class="xterm" />
  </div>
</template>

<script lang="jsx">
import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { downloadText } from '@/utils/common/index'

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
    return {
      xterm: new Terminal(
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
              selection: '#363535'
            }
          },
          this.xtermConfig
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
  mounted: function() {
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
    reset: function() {
      this.xterm.reset()
    },
    write: function(val) {
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
$header-bg-color: #f5f6f7;
$actions-hover-bg-color: #d2d2d2;

.term-wrapper {
  position: relative;

  .term-header {
    position: relative;
    display: flex;
    align-items: center;
    height: 45px;
    padding-left: 15px;
    background-color: $header-bg-color;

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
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-right: 10px;
      background-color: $header-bg-color;

      .action-item {
        display: flex;
        align-items: center;

        .el-button {
          border: none;
          padding: 2px;
          font-size: 14px;
          width: 26px;
          height: 26px;
          color: #888;
          background-color: transparent;
          margin-left: 2px;

          &:hover {
            background-color: $actions-hover-bg-color !important;
            color: var(--color-text-primary);
          }

          &:focus {
            background-color: $actions-hover-bg-color !important;
            color: var(--color-text-primary);
          }
        }
      }
    }
  }

  .xterm {
    overflow: auto;
    padding: 10px 0 0 20px;
    background-color: #ffffff;
  }
}
</style>
