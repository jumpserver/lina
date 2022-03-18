<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <!--      <RelationCard ref="RelationCard" type="info" v-bind="nodeRelationConfig" />-->
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
// import RelationCard from '@/components/RelationCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'Detail',
  components: {
    DetailCard
    // RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      nodeRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.ReplaceNodeAssetsAdminUserWithThis'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          transformOption: (item) => {
            return { label: item.full_value, value: item.id }
          }
        },
        performAdd: (items) => {
          const data = []
          const relationUrl = `/api/v1/assets/admin-users/${this.object.id}/nodes/`
          items.map(v => {
            data.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: data }).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
        },
        onAddSuccess: () => {
          this.$refs.RelationCard.$refs.select2.clearSelected()
        }
      }
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
          key: this.$t('acl.username_group'),
          value: this.object.users.username_group.toString()
        },
        {
          key: this.$t('acl.hostname_group'),
          value: this.object.assets.hostname_group.toString()
        },
        {
          key: this.$t('acl.asset_ip_group'),
          value: this.object.assets.ip_group.toString()
        },
        {
          key: this.$t('acl.system_users_name_group'),
          value: this.object.system_users.name_group.toString()
        },
        {
          key: this.$t('acl.system_users_protocol_group'),
          value: this.object.system_users.protocol_group.toString()
        },
        {
          key: this.$t('acl.system_users_username_group'),
          value: this.object.system_users.username_group.toString()
        },
        {
          key: this.$t('acl.action'),
          value: this.object.action_display
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
