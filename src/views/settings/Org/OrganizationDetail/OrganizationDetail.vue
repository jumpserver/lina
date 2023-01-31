<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24" />
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'

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
          key: this.$t('xpack.Organization.admin_users_amount'),
          value: this.object.resource_statistics.admin_users_amount
        },
        {
          key: this.$t('xpack.Organization.system_users_amount'),
          value: this.object.resource_statistics.system_users_amount
        },
        {
          key: this.$t('xpack.Organization.applications_amount'),
          value: this.object.resource_statistics.applications_amount
        },
        {
          key: this.$t('xpack.Organization.asset_perms_amount'),
          value: this.object.resource_statistics.asset_perms_amount
        },
        {
          key: this.$t('xpack.Organization.app_perms_amount'),
          value: this.object.resource_statistics.app_perms_amount
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
