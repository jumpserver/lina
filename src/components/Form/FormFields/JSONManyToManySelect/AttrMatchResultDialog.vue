<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('MatchResult')"
    :v-bind="$attrs"
    :v-on="$listeners"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <ListTable v-bind="attrMatchTableConfig" />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import ListTable from '@/components/Table/ListTable/index.vue'

export default {
  name: 'AttrMatchResultDialog',
  components: { ListTable, Dialog },
  props: {
    url: {
      type: String,
      default: ''
    },
    attrs: {
      type: Array,
      default: () => []
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      attrMatchTableConfig: {
        headerActions: {
          hasCreate: false,
          hasImport: false,
          hasExport: false,
          hasMoreActions: false
        },
        tableConfig: {
          url: this.url,
          columns: this.attrs
            .filter(item => item.inTable)
            .map(item => {
              return {
                prop: item.name,
                label: item.label,
                formatter: item.formatter
              }
            }),
          columnsMeta: {
            actions: {
              has: false
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
