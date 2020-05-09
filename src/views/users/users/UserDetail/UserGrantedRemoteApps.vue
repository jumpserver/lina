<template>
  <IBox>
    <ListTable :table-config="tableConfig" :header-actions="headerActions" />
  </IBox>
</template>

<script>
import { IBox, ListTable } from '@/components'

export default {
  name: 'UserGrantedRemoteApps',
  components: {
    IBox,
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
        url: `/api/v1/perms/users/${this.object.id}/remote-apps/?draw=1`,
        columns: ['name', 'type', 'asset', 'comment'],
        columnsMeta: {
          asset: {
            formatter(row) {
              return row.asset_info.hostname
            }
          }
        },
        actions: {
          detailRoute: 'RemoteAppDetail'
        }
      },
      headerActions: {
        hasLeftActions: false
      }
    }
  }
}
</script>

<style scoped>

</style>
