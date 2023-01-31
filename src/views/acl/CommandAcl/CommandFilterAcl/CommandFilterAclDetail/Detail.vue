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
          value: this.object.command_groups.map((item) => { return item.name }).join(', ')
        },
        'comment'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
