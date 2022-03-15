<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'
export default {
  name: 'UserGrantedApplications',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/users/${this.object.id}/applications/`,
        columns: ['name', 'category_display', 'type', 'asset', 'comment'],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: this.$hasPerm('applications.view_application'),
              route: 'RemoteAppDetail'
            }
          },
          type: {
            displayKey: 'type_display',
            width: '140px'
          },
          asset: {
            label: this.$t('assets.Asset'),
            formatter(row) {
              return row.attrs.host || row.attrs.hostname
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false
      }
    }
  }
}
</script>

<style scoped>

</style>
