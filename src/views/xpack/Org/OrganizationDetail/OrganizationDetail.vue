<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :title="cardTitle" :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24" />
  </el-row>
</template>

<script>
import { DetailCard } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'OrganizationDetail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    },
    detailCardItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.name
        },
        {
          key: this.$t('common.createBy'),
          value: this.object.created_by
        },
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
        {
          key: this.$t('common.dateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
