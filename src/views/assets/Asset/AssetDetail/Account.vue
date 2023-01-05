<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="16" :sm="24">
        <AccountListTable
          ref="ListTable"
          v-bind="$attrs"
          :asset="object"
          :url="iUrl"
          :has-import="false"
          :has-clone="false"
          :has-left-actions="true"
          :columns="columns"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AccountListTable } from '@/components'

export default {
  name: 'Detail',
  components: {
    AccountListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    },
    url: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      columns: [
        'name', 'username', 'version', 'privileged', 'connectivity',
        'is_active', 'date_created', 'date_updated', 'actions'
      ]
    }
  },
  computed: {
    iUrl() {
      return this.url || `/api/v1/accounts/accounts/?asset=${this.object.id}`
    }
  }
}
</script>

<style lang='less' scoped>

</style>
