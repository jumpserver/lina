<template>
  <Dialog
    v-if="visible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('TestGatewayTestConnection')"
    :visible="visible"
    top="35vh"
    width="40%"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="gateway-test">
      <div class="gateway-test__row">
        <span class="gateway-test__label">{{ $t('SSHPort') }}</span>
        <div class="gateway-test__field">
          <div class="gateway-test__control">
            <el-input
              v-model="iPort"
              :placeholder="$t('SSHPort')"
              class="gateway-test__input jms-input-spacing"
            />
            <el-button
              :loading="loading"
              class="gateway-test__btn"
              type="primary"
              @click="dialogConfirm"
            >
              {{ $t('Confirm') }}
            </el-button>
          </div>
          <div class="gateway-test__tip">{{ $t('TestGatewayHelpMessage') }}</div>
        </div>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'GatewayDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    port: {
      type: Number,
      default: 0
    },
    cell: {
      type: String,
      default: ''
    }
  },
  emits: ['update:visible', 'update:port'],
  data() {
    return {
      // 用本地 state 承接端口:父组件仅单向传入 :port(无 v-model:port),
      // 若沿用受控 computed 会因父组件不回传 update:port 而导致无法输入。
      iPort: this.port
    }
  },
  watch: {
    port: {
      handler(val) {
        this.iPort = val
      },
      immediate: true
    }
  },
  methods: {
    dialogConfirm() {
      if (this.iPort === '' || isNaN(this.iPort)) {
        return this.$message.error(this.$tc('TestPortErrorMsg'))
      }
      this.$emit('update:port', this.iPort)
      this.$axios
        .post(`/api/v1/assets/gateways/${this.cell}/test-connective/`, { port: Number(this.iPort) })
        .then((res) => {
          openTaskPage(res['task'])
        })
        .finally(() => {
          this.$emit('update:visible', false)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.gateway-test {
  &__row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  &__label {
    flex: 0 0 auto;
    white-space: nowrap;
    font-size: 13px;
    line-height: 30px; // 与首行 30px 输入框垂直对齐
    color: var(--color-text-primary);
  }

  // 标签右侧的纵向列:输入行 + 提示,使提示左侧与输入框左侧对齐
  &__field {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__control {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__input {
    flex: 1 1 auto;
    min-width: 0;

    :deep(.el-input__wrapper) {
      min-height: 30px;
      height: 30px;
    }
  }

  &__btn {
    flex: 0 0 auto;
    height: 30px;
  }

  &__tip {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--color-text-secondary);
  }
}
</style>
