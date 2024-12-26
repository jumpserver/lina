<template>
  <el-row :gutter="20">
    <el-col :md="24" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="20" :sm="24" />
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'OrganizationDetail',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/orgs/orgs/${this.object.id}/`,
      detailFields: [
        'name', 'created_by',
        {
          key: this.$t('UsersAmount'),
          value: this.object.resource_statistics.users_amount
        },
        {
          key: this.$t('GroupsAmount'),
          value: this.object.resource_statistics.groups_amount
        },
        {
          key: this.$t('AssetsAmount'),
          value: this.object.resource_statistics.assets_amount
        },
        {
          key: this.$t('AssetPermsAmount'),
          value: this.object.resource_statistics.asset_perms_amount
        },
        'date_created', 'comment'
      ]
    }
  }
}
</script>

<style scoped>

</style>
