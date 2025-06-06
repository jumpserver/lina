<template>
  <div>
    <BaseList v-bind="config" />
    <GatewayDialog
      :cell="GatewayCell"
      :port="GatewayPort"
      :visible.sync="GatewayVisible"
    />
  </div>
</template>

<script>
import BaseList from './components/BaseList'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import GatewayDialog from '@/components/Apps/GatewayTestDialog'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    BaseList,
    GatewayDialog
  },
  data() {
    const vm = this
    return {
      GatewayPort: 0,
      GatewayCell: '',
      GatewayVisible: false,
      config: {
        url: '/api/v1/assets/hosts/',
        category: 'host',
        optionInfo: {},
        headerActions: {
          extraActions: [
            {
              name: this.$t('CloudSync'),
              title: this.$t('CloudSync'),
              icon: 'cloud-provider',
              has: () => vm.$hasPerm('xpack.view_account') && vm.$hasLicense(),
              callback: () => this.$router.push(
                { name: 'CloudAccountList', query: { category: 'host' }}
              )
            }
          ]
        },
        tableConfig: {
          columnsMeta: {
            actions: {
              formatter: ActionsFormatter,
              formatterArgs: {
                performDelete: ({ row }) => {
                  const id = row.id
                  const url = `/api/v1/assets/hosts/${id}/`
                  return this.$axios.delete(url)
                },
                extraActions: [
                  {
                    name: 'Test',
                    title: this.$t('Test'),
                    can: ({ row }) =>
                      this.$hasPerm('assets.test_assetconnectivity') &&
                      !this.$store.getters.currentOrgIsRoot &&
                      row['auto_config'].ansible_enabled &&
                      row['auto_config'].ping_enabled,
                    callback: ({ row }) => {
                      if (row.platform.name.startsWith('Gateway')) {
                        this.GatewayVisible = true
                        const port = row.protocols.find(item => item.name === 'ssh').port
                        if (!port) {
                          return this.$message.error(this.$tc('BadRequestErrorMsg'))
                        } else {
                          this.GatewayPort = port
                          this.GatewayCell = row.id
                        }
                      } else {
                        this.$axios.post(
                          `/api/v1/assets/assets/${row.id}/tasks/`,
                          { action: 'test' }
                        ).then(res => {
                          openTaskPage(res['task'])
                        })
                      }
                    }
                  }
                ]
              }
            }
          }
        }
      }
    }
  },
  async mounted() {
    this.config.optionInfo = await this.optionAndGenFields()
  },
  methods: {
    async optionAndGenFields() {
      const data = await this.$store.dispatch('common/getUrlMeta', { url: this.config.url })
      const remoteMeta = data.actions['GET'] || {}
      const remoteMetaFields = remoteMeta['info']?.children || {}
      const fields = Object.keys(remoteMetaFields)
      const info = {}
      for (const name of fields) {
        info[name] = remoteMetaFields[name].label
      }
      return info
    }
  }
}
</script>
