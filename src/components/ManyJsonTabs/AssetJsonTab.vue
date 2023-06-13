<template>
  <el-row :gutter="24">
    <el-col :md="20" :sm="22">
      <ListTable v-bind="config" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable/index.vue'
import { toM2MJsonParams } from '@/utils/jms'

export default {
  name: 'AssetJsonTab',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
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
          columns: ['name', 'address', 'platform',
            'type', 'is_active'
          ],
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
    iUrl() {
      return `/api/v1/users/users/`
    }
  }
}
</script>

<style scoped>

</style>
