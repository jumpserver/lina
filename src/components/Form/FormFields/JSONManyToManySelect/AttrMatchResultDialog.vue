<template>
  <Dialog
    :destroy-on-close="true"
    :show-buttons="false"
    :title="$tc('common.MatchResult')"
    :v-bind="$attrs"
    :v-on="$listeners"
    :visible.sync="iVisible"
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
      default: () => ([])
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
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
          columns: this.attrs.filter(item => item.inTable).map(item => {
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
  },
  computed: {
    iVisible: {
      set(val) {
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  }
}
</script>

<style scoped>

</style>
