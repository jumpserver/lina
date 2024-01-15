<template>
  <Dialog
    :show-buttons="false"
    :title="$tc('labels.BindResource')"
    destroy-on-close
    v-bind="$attrs"
    v-on="$listeners"
  >
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
  </Dialog>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
import { Dialog } from '@/components'

export default {
  name: 'LabelResourcesDialog',
  components: { ListTable, Dialog },
  props: {
    label: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/labels/labeled-resources/?label=${this.label.id}`,
        columns: [
          'resource', 'res_type', 'actions'
        ],
        columnsMeta: {
          actions: {
            formatterArgs: {
              hasClone: false,
              hasUpdate: false
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        onCreate: () => {
          this.$emit('addResource')
        },
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
