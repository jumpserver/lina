<template>
  <div>
    <TwoCol>
      <template>
        <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      </template>
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
      </template>
    </TwoCol>
    <SecretDialog ref="secretDialog" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import SecretDialog from '@/components/Dialog/Secret.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'IntegrationApplicationInfo',
  components: {
    TwoCol,
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
