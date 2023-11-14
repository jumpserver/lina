<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <BindDrawer :visible.sync="bindVisible" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import BindDrawer from '@/views/labels/BindDrawer.vue'

export default {
  components: {
    BindDrawer,
    GenericListPage
  },
  data() {
    return {
      bindVisible: false,
      tableConfig: {
        url: '/api/v1/labels/labels/',
        columnsShow: {
          default: ['name', 'value', 'res_count', 'date_created', 'date_updated', 'actions'],
          min: ['name', 'action']
        },
        columnsMeta: {
          actions: {
            formatterArgs: {
              extraActions: [
                {
                  title: 'Bind',
                  name: 'bind',
                  callback: () => {
                    this.bindVisible = true
                  }
                }
              ]
            }
          }

        }
      },
      headerActions: {}
    }
  }
}
</script>

<style>

</style>
