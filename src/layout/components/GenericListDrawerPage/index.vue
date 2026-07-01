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
  mounted() {
    this.$store.dispatch('common/getDrawerActionMeta').then((res) => {
      if (res.action) {
        this.drawer = true
      }
    })
  },
  methods: {
    reloadTable() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
