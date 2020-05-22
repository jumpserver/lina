<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, QuickActions } from '@/components'

export default {
  name: 'ChangeAuthPlanInfo',
  components: {
    DetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      quickActions: [

      ]
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: 'name',
          value: this.object.name
        },
        {
          key: 'username',
          value: this.object.username
        },
        {
          key: 'password strategy',
          value: this.object.password_strategy
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
