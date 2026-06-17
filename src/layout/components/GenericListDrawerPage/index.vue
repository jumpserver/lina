<template>
  <Page v-bind="pageAttrs">
    <DrawerListTable v-bind="$attrs" ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig" />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import DrawerListTable from '@/components/Table/DrawerListTable/index'
import { mapGetters } from 'vuex'

export default {
  name: 'GenericListDrawerPage',
  components: {
    Page, DrawerListTable
  },
  props: {
    tableConfig: {
      type: Object,
      required: true
    },
    headerActions: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters(['inDrawer']),
    pageAttrs() {
      return {
        ...this.$attrs,
        hideHeading: this.inDrawer
      }
    }
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
