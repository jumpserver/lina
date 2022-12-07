<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    DetailCard
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
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('acl.name'),
          value: this.object.name
        },
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
          value: this.object.assets.address_group.toString()
        },
        {
          key: this.$t('acl.AccountUsername'),
          value: this.object.accounts.username_group.toString()
        },
        {
          key: this.$t('acl.action'),
          value: this.object.action.label
        },
        {
          key: this.$t('acl.reviewer'),
          value: this.object.reviewers.map((reviewer) => { return reviewer.name }).join(' | ')
        },
        {
          key: this.$t('acl.priority'),
          value: this.object.priority
        },
        {
          key: this.$t('acl.date_created'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('acl.created_by'),
          value: this.object.created_by
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
