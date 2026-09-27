<template>
  <IBox v-if="actions.length" title="TicketViewSecret" class="ticket-secret-access">
    <div v-for="action in actions" :key="action.account_id" class="access-row">
      <div>
        <strong>{{ action.name }}</strong>
        <span class="access-expiry">
          {{ $t('DateExpired') }}: {{ toSafeLocalDateStr(action.expires_at) }}
        </span>
      </div>
      <el-button type="primary" :loading="loadingId === action.account_id" @click="reveal(action)">
        {{ $t('ViewSecret') }}
      </el-button>
    </div>
    <el-dialog v-model="visible" :title="$t('TicketViewSecret')" width="480px" @closed="clear">
      <el-form label-position="top">
        <el-form-item :label="$t('Account')">{{ accountName }}</el-form-item>
        <el-form-item :label="$t('Password')">
          <el-input :model-value="secret" readonly autocomplete="off" />
        </el-form-item>
      </el-form>
    </el-dialog>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { useDateTime } from '@/composables/useDateTime'

export default {
  name: 'TicketSecretAccess',
  components: { IBox },
  props: { object: { type: Object, required: true } },
  setup: useDateTime,
  data: () => ({ visible: false, loadingId: '', accountName: '', secret: '' }),
  computed: {
    actions() {
      return (this.object.available_actions || []).filter((item) => item.type === 'view_secret')
    }
  },
  methods: {
    async reveal(action) {
      this.loadingId = action.account_id
      try {
        const result = await this.$axios.post(
          `/api/v1/accounts/accounts/${action.account_id}/reveal-by-ticket/`,
          { ticket_id: this.object.id },
          { params: { oid: this.object.org_id } }
        )
        this.accountName = result.name
        this.secret = result.secret
        this.visible = true
      } finally {
        this.loadingId = ''
      }
    },
    clear() {
      this.secret = ''
      this.accountName = ''
    }
  }
}
</script>

<style scoped>
.access-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.access-row + .access-row {
  margin-top: 12px;
}
.access-expiry {
  display: block;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}
</style>
