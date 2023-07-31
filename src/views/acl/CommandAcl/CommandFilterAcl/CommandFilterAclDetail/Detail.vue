<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'CommandFilterAclDetail',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/acls/command-filter-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('acl.CommandGroup'),
          value: this.object.command_groups.map((item) => item.name).join(', ')
        },
        {
          key: this.$t('acl.action'),
          value: this.object.action?.label
        },
        (this.object.action?.value === 'review' && {
          key: this.$t('acl.reviewer'),
          value: this.object?.reviewers.map((item) => item?.name).join(', ')
        }),
        'priority', 'is_active', 'comment'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
