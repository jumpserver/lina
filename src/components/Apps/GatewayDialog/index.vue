<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.TestGatewayTestConnection')"
    :visible.sync="iVisible"
    top="35vh"
    width="40%"
  >
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div style="line-height: 34px">{{ $t('assets.SSHPort') }}</div>
      </el-col>
      <el-col :md="14" :sm="24">
        <el-input v-model="port" />
        <span class="help-tips help-block">{{ $t('assets.TestGatewayHelpMessage') }}</span>
      </el-col>
      <el-col :md="4" :sm="24">
        <el-button
          :loading="loading"
          size="mini"
          style="line-height:20px "
          type="primary"
          @click="dialogConfirm"
        >
          {{ this.$t('common.Confirm') }}
        </el-button>
      </el-col>
    </el-row>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { openTaskPage } from '@/utils/jms'

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
  data() {
    return {}
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    dialogConfirm() {
      if (isNaN(this.port)) {
        return this.$message.error(this.$tc('common.TestPortErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/assets/gateways/${this.cell}/test-connective/`,
        { port: this.port }
      )
        .then((res) => {
          openTaskPage(res['task'])
        }).finally(() => {
          this.iVisible = false
        })
    }
  }
}
</script>
