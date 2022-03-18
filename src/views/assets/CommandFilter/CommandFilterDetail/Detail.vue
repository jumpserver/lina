<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <RelationCard ref="systemUserRelation" v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import RelationCard from '@/components/RelationCard'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'Detail',
  components: {
    DetailCard,
    RelationCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      systemUserRelationConfig: {
        icon: 'fa-info',
        title: this.$t('perms.addSystemUserToThisPermission'),
        objectsAjax: {
          url: `/api/v1/assets/system-users/?protocol__in=ssh,telnet,mysql,postgresql,mariadb,oracle,sqlserver,k8s`,
          transformOption: (item) => {
            const username = item.username || '*'
            return { label: item.name + '(' + username + ')', value: item.id }
          }
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          const newData = []
          const value = this.$refs.systemUserRelation.iHasObjects
          value.map(v => {
            newData.push(v.value)
          })
          const relationUrl = `/api/v1/assets/cmd-filters/${this.object.id}/`
          items.map(v => {
            newData.push(v.value)
          })
          return this.$axios.patch(relationUrl, { system_users: newData })
        },
        performDelete: (item) => {
          const itemId = item.value
          const newData = []
          const value = this.$refs.systemUserRelation.iHasObjects
          value.map(v => {
            if (v.value !== itemId) {
              newData.push(v.value)
            }
          })
          const relationUrl = `/api/v1/assets/cmd-filters/${this.object.id}/`
          return this.$axios.patch(relationUrl, { system_users: newData })
        }
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.Name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.date_joined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        },
        {
          key: this.$t('assets.CreatedBy'),
          value: this.object.created_by
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

<style lang='less' scoped>

</style>
