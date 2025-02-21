<template>
  <Page v-bind="$attrs">
    <DrawerListTable
      ref="ListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      v-bind="$attrs"
      v-on="$listeners"
    />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import DrawerListTable from '@/components/Table/DrawerListTable/index'

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
  data() {
    return {}
  }
}
</script>
