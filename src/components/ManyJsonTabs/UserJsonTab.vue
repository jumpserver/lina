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
  name: 'User',
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
    const [key, value] = toM2MJsonParams(this.object.users)
    return {
      config: {
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        },
        tableConfig: {
          url: `/api/v1/users/users/?${key}=${value}`,
          columns: ['name', 'username'],
          columnsShow: {
            min: ['id']
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
