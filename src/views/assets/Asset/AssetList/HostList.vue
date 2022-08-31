<template>
  <BaseList
    :category="'host'"
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
</template>

<script>
import BaseList from './components/BaseList'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    BaseList
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/hosts/',
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
      },
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
      }
    }
  }
}
</script>

<style>

</style>
