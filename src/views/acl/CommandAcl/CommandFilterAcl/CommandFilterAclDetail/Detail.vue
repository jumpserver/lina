<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'

export default {
  name: 'CommandFilterAclDetail',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
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
          key: this.$t('common.Name'),
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
          key: this.$t('acl.CommandGroup'),
          value: this.object.command_groups.map((commandGroup) => { return commandGroup.name }).join(' | ')
        },
        {
          key: this.$t('assets.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
