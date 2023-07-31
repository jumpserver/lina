<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24" />
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
          key: this.$t('xpack.Organization.users_amount'),
          value: this.object.resource_statistics.users_amount
        },
        {
          key: this.$t('xpack.Organization.groups_amount'),
          value: this.object.resource_statistics.groups_amount
        },
        {
          key: this.$t('xpack.Organization.assets_amount'),
          value: this.object.resource_statistics.assets_amount
        },
        {
          key: this.$t('xpack.Organization.asset_perms_amount'),
          value: this.object.resource_statistics.asset_perms_amount
        },
        'date_created', 'comment'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  }
}
</script>

<style scoped>

</style>
