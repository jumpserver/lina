<template>
  <TwoCol>
    <BaseList v-bind="config" />
  </TwoCol>
</template>

<script>
import BaseList from '../../Asset/AssetList/components/BaseList'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
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
        defaultColumns: [
          'name', 'address'
        ],
        tableConfig: {
          columnsShow: {
            min: ['name'],
            default: ['name']
          },
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
