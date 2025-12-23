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
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div style="line-height: 34px">{{ $t('SSHPort') }}</div>
      </el-col>
      <el-col :md="14" :sm="24">
        <el-input v-model="iPort" />
        <span class="help-tips help-block">{{ $t('TestGatewayHelpMessage') }}</span>
      </el-col>
      <el-col :md="4" :sm="24">
        <el-button
          :loading="loading"
          size="small"
          style="line-height: 20px"
          type="primary"
          @click="dialogConfirm"
        >
          {{ $t('Confirm') }}
        </el-button>
      </el-col>
    </el-row>
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
    return {}
  },
  computed: {
    iPort: {
      get() {
        return this.port
      },
      set(val) {
        this.$emit('update:port', val)
      }
    }
  },
  methods: {
    dialogConfirm() {
      if (isNaN(this.port)) {
        return this.$message.error(this.$tc('TestPortErrorMsg'))
      }
      this.$axios
        .post(`/api/v1/assets/gateways/${this.cell}/test-connective/`, { port: this.port })
        .then(res => {
          openTaskPage(res['task'])
        })
        .finally(() => {
          this.$emit('update:visible', false)
        })
    }
  }
}
</script>
