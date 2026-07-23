<template>
  <Page v-bind="pageAttrs">
    <DrawerListTable
      v-bind="$attrs"
      ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import DrawerListTable from '@/components/Table/DrawerListTable/index'
import { getRuntimeActionMeta, isOverlayRuntime } from '@/libs/context/runtime'

export default {
  name: 'GenericListDrawerPage',
  components: {
    Page,
    DrawerListTable
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
  data() {
    return {
      drawer: false
    }
  },
  computed: {
    pageAttrs() {
      return {
        ...this.$attrs,
        hideHeading: this.drawer
      }
    }
  },
  async mounted() {
    if (isOverlayRuntime(this)) {
      this.drawer = true
      return
    }
    const actionMeta = await getRuntimeActionMeta(this)
    if (actionMeta?.action) {
      this.drawer = true
    }
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
