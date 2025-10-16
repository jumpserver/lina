<template>
  <TwoCol>
    <ListTable v-bind="config" />
  </TwoCol>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
import { toM2MJsonParams } from '@/utils/jms/index'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AssetJsonTab',
  components: {
    TwoCol,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    const [key, value] = toM2MJsonParams(this.object.assets)
    const org_id = this.object.org_id || this.$store.getters.currentOrg.id
    return {
      config: {
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        },
        tableConfig: {
          url: `/api/v1/assets/assets/?${key}=${value}&oid=${org_id}`,
          columns: ['name', 'address', 'platform', 'type', 'is_active'],
          columnsShow: {
            min: ['name', 'address'],
            default: ['name', 'address', 'platform']
          },
          columnsMeta: {
            name: {
              label: this.$t('Asset'),
              formatter: DetailFormatter,
              formatterArgs: {
                getRoute: ({ row }) => {
                  return { name: 'AssetDetail', params: { id: row.id } }
                }
              }
            },
            actions: {
              has: false
            }
          }
        }
      }
    }
  },
  computed: {
    iUrl() {
      return `/api/v1/users/users/`
    }
  }
}
</script>
