<template>
  <el-dialog
    v-model="visible"
    :title="$t('TicketViewSecret')"
    width="500px"
    @closed="$emit('close')"
  >
    <div v-loading="loading">
      <el-form label-position="top">
        <el-form-item :label="$t('Account')">
          {{ account.name }} ({{ account.username }})
        </el-form-item>
        <el-form-item :label="$t('TicketFlow')">
          <el-select v-model="workflowId" style="width: 100%">
            <el-option
              v-for="flow in workflows"
              :key="flow.id"
              :label="flow.name"
              :value="flow.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('Duration')">
          <el-input-number v-model="duration" :min="60" :max="86400" />
        </el-form-item>
        <el-form-item :label="$t('Comment')">
          <el-input v-model="comment" type="textarea" :rows="3" maxlength="4096" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button @click="visible = false">{{ $t('Cancel') }}</el-button>
      <el-button
        type="primary"
        :disabled="!workflowId || loading"
        :loading="submitting"
        @click="submit"
      >
        {{ $t('OpenTicket') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'AccountSecretTicketRequest',
  props: { account: { type: Object, required: true } },
  emits: ['close', 'created'],
  data: () => ({
    visible: true,
    loading: false,
    submitting: false,
    workflows: [],
    workflowId: '',
    orgId: '',
    duration: 600,
    comment: ''
  }),
  async mounted() {
    this.loading = true
    try {
      const result = await this.$axios.get(
        `/api/v1/accounts/accounts/${this.account.id}/request-secret-ticket/`
      )
      this.orgId = result.org_id
      this.workflows = result.workflows
      if (this.workflows.length === 1) this.workflowId = this.workflows[0].id
    } finally {
      this.loading = false
    }
  },
  methods: {
    async submit() {
      if (!this.workflowId || this.submitting) return
      this.submitting = true
      try {
        const ticket = await this.$axios.post(
          `/api/v1/accounts/accounts/${this.account.id}/request-secret-ticket/`,
          { workflow_id: this.workflowId, duration: this.duration, comment: this.comment },
          { params: { oid: this.orgId } }
        )
        this.visible = false
        this.$emit('created', { id: ticket.id, orgId: this.orgId })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
