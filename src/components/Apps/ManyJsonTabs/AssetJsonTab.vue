<template>
  <TwoCol>
    <ListTable v-bind="config" />
  </TwoCol>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'
import { toM2MJsonParams } from '@/utils/jms'
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
    return {
      config: {
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        },
        tableConfig: {
          url: `/api/v1/assets/assets/?${key}=${value}`,
          columns: ['name', 'address', 'platform', 'type', 'is_active'],
          columnsShow: {
            min: ['name', 'address'],
            default: ['name', 'address', 'platform']
          },
          columnsMeta: {
            name: {
              label: this.$t('Asset'),
              formatter: (row) => {
                const to = {
                  name: 'AssetDetail',
                  params: { id: row.id }
                }
                if (this.$hasPerm('assets.view_asset')) {
                  return <router-link to={to} class='text-link'>{row.name}</router-link>
                } else {
                  return <span>{row.name}</span>
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

<style scoped>

</style>
