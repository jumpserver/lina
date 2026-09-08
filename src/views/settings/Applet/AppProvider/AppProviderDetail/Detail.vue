<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
    </template>
  </TwoCol>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    QuickActions,
    TwoCol
  },
  emits: ['refresh', 'change-tab'],
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/terminal/app-providers/${this.object.id}`,
      detailFields: [
        'name',
        'hostname',
        'host',
        'deploy_options',
        'load',
        'date_created',
        'date_updated',
        'comment'
      ]
    }
  },
  computed: {
    quickActions() {
      const host = this.object.host
      const canManageHost = Boolean(host)
      return [
        {
          title: this.$t('AppProviderDeployment'),
          attrs: { type: 'primary', label: this.$t('View') },
          callbacks: { click: () => this.$emit('change-tab', 'Deployments') }
        },
        {
          title: this.$t('IsActive'),
          type: 'switch',
          attrs: {
            label: this.$t('IsActive'),
            model: host?.is_active || false,
            disabled: !canManageHost || !this.$hasPerm('assets.change_asset')
          },
          callbacks: {
            change: (value, action) => {
              this.$axios
                .patch(`/api/v1/assets/assets/${host.id}/`, { is_active: value })
                .then(() => {
                  this.$message.success(this.$tc('UpdateSuccessMsg'))
                  this.$emit('refresh')
                })
                .catch(() => {
                  action.attrs.model = host.is_active
                })
            }
          }
        },
        {
          title: this.$t('RefreshHardware'),
          attrs: {
            type: 'primary',
            label: this.$t('Refresh'),
            disabled: !canManageHost || !this.$hasPerm('assets.refresh_assethardwareinfo')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post(`/api/v1/assets/assets/${host.id}/tasks/`, { action: 'refresh' })
                .then((res) => openTaskPage(res.task))
            }
          }
        },
        {
          title: this.$t('TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$t('Test'),
            disabled: !canManageHost || !this.$hasPerm('assets.test_assetconnectivity')
          },
          callbacks: {
            click: () => {
              this.$axios
                .post(`/api/v1/assets/assets/${host.id}/tasks/`, { action: 'test' })
                .then((res) => openTaskPage(res.task))
            }
          }
        },
        {
          title: this.$t('Status'),
          attrs: { type: 'primary', label: this.$t('Refresh') },
          callbacks: { click: () => this.$emit('refresh') }
        }
      ]
    }
  }
}
</script>
