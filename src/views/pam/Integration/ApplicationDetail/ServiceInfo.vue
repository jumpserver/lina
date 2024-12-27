<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="24" :sm="24">
        <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      </el-col>
      <el-col :md="20" :sm="24" class="detail-right-quick-actions">
        <QuickActions :actions="quickActions" type="primary" />
      </el-col>
    </el-row>
    <SecretDialog ref="secretDialog" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import SecretDialog from '@/components/Dialog/Secret.vue'

export default {
  name: 'IntegrationApplicationInfo',
  components: {
    SecretDialog,
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      warningText: this.$t('ApiKeyWarning'),
      key: { id: '', secret: '' },
      quickActions: [
        {
          title: this.$t('Secret'),
          attrs: {
            type: 'primary',
            label: this.$t('Generate'),
            disabled: !this.$hasPerm('accounts.change_integrationapplication') || !this.object.is_active
          },
          callbacks: {
            click: function() {
              this.$axios.get(
                `/api/v1/accounts/integration-applications/${this.object.id}/secret/`,
              ).then(res => {
                this.$refs.secretDialog.show(res)
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/integration-applications/${this.object.id}`,
      detailFields: [
        'id', 'name', 'date_created', 'date_updated', 'comment', 'is_active'
      ]
    }
  },
  computed: {}
}
</script>
