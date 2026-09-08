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
            fields: ['name', 'address', 'zone', 'protocols', 'accounts', 'is_active'],
            fieldsMeta: {}
          },
          deploy_options: {
            fields: ['CORE_HOST', 'IGNORE_VERIFY_CERTS', 'PANDA_IMAGE', 'PANDA_RANGE_PORTS'],
            fieldsMeta: {
              CORE_HOST: { helpText: this.$t('AppProviderCoreHostHelp') },
              PANDA_IMAGE: { helpText: this.$t('AppProviderPandaImageHelp') }
            }
          }
        },
        afterGetFormValue: (value) => {
          const accounts = this.config.fieldsMeta.host.fieldsMeta.accounts.el
          accounts.isUpdate = () => Boolean(value.host?.id)
          accounts.accountsDrawer = {
            component: () => import('./AppProviderDetail/index.vue'),
            id: value.id,
            routeName: 'AppProviderDetail',
            tab: 'Accounts'
          }
          if (!value.host) {
            value.host = {
              ...this.config.initial.host,
              name: value.name || '',
              address: value.hostname || ''
            }
          }
          return value
        },
        objectDetailRoute: { name: 'AppProviderDetail' },
        getNextRoute: (res, method) => ({
          name: 'AppProviderDetail',
          params: { id: res.id },
          query: { tab: method === 'post' ? 'Deployments' : 'Detail' }
        }),
        onPerformSuccess: async (res, method, vm, addContinue) => {
          vm.$emit('submitSuccess', res)
          vm.emitPerformSuccessMsg(method, res, addContinue)
          if (addContinue) return
          if (vm.drawer) {
            await this.$store.dispatch('common/finishDrawerActionMeta', {
              action: vm.action,
              row: res
            })
            await this.$nextTick()
            if (method !== 'post') return
          }
          this.$router.push(this.config.getNextRoute(res, method))
        }
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
    const ssh = platform.protocols.find(({ name }) => name === 'ssh') || { name: 'ssh', port: 22 }
    platform = { ...platform, protocols: [{ ...ssh, required: true, default: true }] }
    const hostFieldsMeta = assetFieldsMeta(this, 'host', 'linux')
    hostFieldsMeta.protocols.el.choices.push(...platform.protocols)
    hostFieldsMeta.protocols.el.showSetting = () => false
    hostFieldsMeta.protocols.helpText = this.$t('AppProviderSSHHelp')
    hostFieldsMeta.accounts.el.platform = platform
    hostFieldsMeta.accounts.helpText = this.$t('AppProviderAccountHelp')
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
        is_active: true
      }
    }
    this.loading = false
  }
}
</script>
