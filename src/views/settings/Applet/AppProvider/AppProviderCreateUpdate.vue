<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="config" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { assetFieldsMeta } from '@/views/assets/const'

export default {
  name: 'AppProviderCreateUpdate',
  components: { GenericCreateUpdatePage },
  data() {
    return {
      loading: true,
      config: {
        url: '/api/v1/terminal/app-providers/',
        fields: [
          [this.$t('Basic'), ['host']],
          [this.$t('Automation'), ['deploy_options']],
          [this.$t('Other'), ['comment']]
        ],
        fieldsMeta: {
          host: {
            fields: [
              'name',
              'address',
              'zone',
              'protocols',
              'accounts',
              'nodes_display',
              'is_active'
            ],
            fieldsMeta: {}
          },
          deploy_options: {
            fields: ['CORE_HOST', 'IGNORE_VERIFY_CERTS', 'PANDA_IMAGE', 'PANDA_RANGE_PORTS']
          }
        },
        afterGetFormValue: (value) => {
          this.config.fieldsMeta.host.fieldsMeta.accounts.el.accountsDrawer = {
            component: () => import('./AppProviderDetail/index.vue'),
            id: value.id,
            routeName: 'AppProviderDetail',
            tab: 'Accounts'
          }
          return value
        },
        createSuccessNextRoute: { name: 'AppProviderDetail' },
        updateSuccessNextRoute: { name: 'AppProviderDetail' }
      }
    }
  },
  async created() {
    let platform = {
      name: 'VirtualAppHost',
      protocols: [{ name: 'ssh', port: 22, required: true, default: true }]
    }
    try {
      platform = await this.$axios.get('/api/v1/assets/platforms/VirtualAppHost/')
    } catch (error) {
      this.$log.warn('Load VirtualAppHost platform failed, use SSH defaults', error)
    }
    const hostFieldsMeta = assetFieldsMeta(this, 'host', 'linux')
    hostFieldsMeta.protocols.el.choices.push(...platform.protocols)
    hostFieldsMeta.accounts.el.platform = platform
    this.config.fieldsMeta.host.fieldsMeta = {
      address: hostFieldsMeta.address,
      zone: hostFieldsMeta.zone,
      protocols: hostFieldsMeta.protocols,
      accounts: hostFieldsMeta.accounts,
      is_active: hostFieldsMeta.is_active
    }
    this.config.initial = {
      host: {
        protocols: platform.protocols.map(({ name, port }) => ({ name, port })),
        accounts: [],
        nodes_display: ['VirtualAppHosts'],
        is_active: true
      }
    }
    this.loading = false
  }
}
</script>
