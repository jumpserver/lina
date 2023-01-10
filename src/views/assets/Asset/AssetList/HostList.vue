<template>
  <BaseList v-bind="config" />
</template>

<script>
import BaseList from './components/BaseList'
import { ActionsFormatter } from '@/components/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  components: {
    BaseList
  },
  data() {
    const vm = this
    return {
      config: {
        url: '/api/v1/assets/hosts/',
        category: 'host',
        headerActions: {
          createRoute: 'HostCreate',
          extraActions: [
            {
              name: this.$t('xpack.Cloud.CloudSync'),
              title: this.$t('xpack.Cloud.CloudSync'),
              has: () => vm.$hasPerm('xpack.view_account') && vm.$hasLicense(),
              callback: () => this.$router.push({ name: 'CloudCenter' })
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
                    title: this.$t('common.Test'),
                    can: this.$hasPerm('assets.test_assetconnectivity'),
                    callback: ({ row }) => {
                      this.$axios.post(
                        `/api/v1/assets/assets/${row.id}/tasks/`,
                        { action: 'test' }
                      ).then(res => {
                        openTaskPage(res['task'])
                      })
                    }
                  },
                  {
                    name: 'View',
                    title: this.$t(`common.UpdateAssetDetail`),
                    type: 'primary',
                    can: vm.$hasPerm('assets.refresh_assethardwareinfo'),
                    callback: function({ cellValue, tableData, row }) {
                      return this.$router.push({
                        name: 'AssetMoreInformationEdit',
                        params: { id: row.id }
                      })
                    }
                  }
                ]
              }
            }
          }
        }
      }

    }
  }
}
</script>

<style>

</style>
