<template>
  <BaseList v-bind="config" />
</template>

<script>
import BaseList from '../../Asset/AssetList/components/BaseList'
import { DetailFormatter } from '@/components/Table/TableFormatters'

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
      config: {
        category: 'all',
        url: `/api/v1/assets/assets/?platform=${this.object.id}`,
        tableConfig: {
          columnsMeta: {
            name: {
              formatter: DetailFormatter,
              formatterArgs: {
                can: false
              }
            },
            actions: {
              has: false
            }
          }
        },
        headerActions: {
          hasCreate: false,
          hasRefresh: false,
          hasExport: false,
          hasImport: false,
          hasMoreActions: false
        }
      }
    }
  }
}
</script>

<style>

</style>
