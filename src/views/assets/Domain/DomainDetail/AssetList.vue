<template>
  <BaseList v-bind="tableConfig" />
</template>

<script>
import BaseList from '../../Asset/AssetList/components/BaseList'

export default {
  components: {
    BaseList
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      tableConfig: {
        category: 'all',
        url: `/api/v1/assets/assets/?domain=${this.$route.params.id}`,
        headerActions: {
          hasCreate: false,
          hasRefresh: true,
          hasExport: false,
          hasImport: false,
          hasMoreActions: true
        }
      }
    }
  }
}
</script>

<style>

</style>
