<template>
  <div>
    <el-button
      size="mini"
      type="primary"
      @click="showToken"
    >
      {{ $t('GetToken') }}
    </el-button>
    <Dialog
      :show-cancel="false"
      :title="$t('BootstrapToken')"
      :visible.sync="visible"
      width="600px"
      @confirm="visible = false"
    >
      <div class="token-tip">{{ $t('BootstrapTokenTip') }}</div>
      <div class="token-block">
        <code
          class="token-value"
          :title="$t('ClickCopy')"
          @click="handleCopy(token)"
        >
          {{ token }}
        </code>
        <i
          class="el-icon-copy-document copy-icon"
          :title="$t('Copy')"
          @click="handleCopy(token)"
        />
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { copy } from '@/utils/common/index'

export default {
  name: 'BootstrapTokenButton',
  components: {
    Dialog
  },
  data() {
    return {
      token: '',
      visible: false
    }
  },
  methods: {
    showToken() {
      this.$axios.get('/api/v1/settings/bootstrap-token/').then(res => {
        this.token = res.bootstrap_token
        this.visible = true
      })
    },
    handleCopy(value) {
      copy(value)
    }
  }
}
</script>

<style lang="scss" scoped>
.token-tip {
  margin-bottom: 12px;
  color: #606266;
  font-size: 13px;
  line-height: 20px;
}

.token-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.token-value {
  flex: 1;
  cursor: pointer;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #2b2f3a;
  word-break: break-all;
}

.copy-icon {
  cursor: pointer;
  color: #606266;
  transition: color 0.2s;
}

.copy-icon:hover {
  color: #409eff;
}
</style>
