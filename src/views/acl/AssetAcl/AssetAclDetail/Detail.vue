<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard
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
      url: `/api/v1/acls/login-asset-acls/${this.object.id}`,
      detailFields: [
        'name',
        {
          key: this.$t('acl.UserUsername'),
          value: this.object.users.username_group.toString()
        },
        {
          key: this.$t('acl.AssetName'),
          value: this.object.assets.name_group.toString()
        },
        {
          key: this.$t('acl.AssetAddress'),
          value: this.object.accounts.username_group.toString()
        },
        {
          key: this.$t('acl.action'),
          value: this.object.action.label
        },
        {
          key: this.$t('acl.reviewer'),
          value: this.object.reviewers.map(item => item.name).join(', ')
        },
        'priority', 'date_created', 'created_by'
      ]
    }
  },
  computed: {
  }
}
</script>

<style lang='less' scoped>

</style>
