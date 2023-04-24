<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="iVisible"
    top="35vh"
    width="40%"
  >
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div style="line-height: 34px">{{ '密文' }}</div>
      </el-col>
      <el-col :md="14" :sm="24">
        <el-input
          v-model="secret"
          :type="template.secret_type.value === 'password' ? 'text' : 'textarea'"
          :rows="template.secret_type.value === 'password' ? 2 : 4"
        />
        <span class="help-tips help-block">{{ '同时会修改通过模版所创建账号的密文' }}</span>
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
import Dialog from '@/components/Dialog'

export default {
  name: 'AccountTemplateChangeSecretDialog',
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
    secret: {
      type: String,
      default: null
    },
    template: {
      type: Object,
      default: null
    },
    sw: {
      type: Boolean,
      default: false
    }
  },
  data() {
    console.log('this.template', this.template)
    return {
      title: '更新密文'
    }
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
      this.$axios.patch(
        `/api/v1/accounts/account-templates/${this.template['id']}/sync-update-secret/`,
        { secret: this.secret }
      )
        .then(() => {
          this.$message.success(this.$tc('common.updateSuccessMsg'))
        }).finally(() => {
          this.iVisible = false
          this.secret = null
        })
    }
  }
}
</script>
