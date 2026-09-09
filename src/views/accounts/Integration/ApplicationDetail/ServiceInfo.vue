<template>
  <div>
    <TwoCol>
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
      <template #right>
        <QuickActions :actions="quickActions" type="primary" />
      </template>
    </TwoCol>
    <SecretDialog ref="secretDialog" :title="$t('ApplicationSecret')" :warning-text="''" />
  </div>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
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
      quickActions: [
        {
          title: this.$t('ApplicationSecret'),
          attrs: {
            type: 'primary',
            label: this.$t('View'),
            disabled:
              !this.$hasPerm('accounts.change_integrationapplication') || !this.object.is_active
          },
          callbacks: {
            click: function () {
              this.$axios
                .get(`/api/v1/accounts/integration-applications/${this.object.id}/secret/`)
                .then((res) => {
                  this.$refs.secretDialog.show(res)
                })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/integration-applications/${this.object.id}`,
      detailFields: ['id', 'name', 'date_created', 'date_updated', 'comment', 'is_active']
    }
  }
}
</script>
