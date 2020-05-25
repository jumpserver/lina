<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
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
          url: '/api/v1/assets/system-users/',
          processResults: (data) => {
            let results = data.results
            const notUndefined = anyValue => typeof anyValue !== 'undefined'
            results = results.map((item) => {
              if (item.protocol === 'ssh' || item.protocol === 'telnet') {
                return { label: `${item.name}(${item.username})`, value: item.id }
              }
            }).filter(notUndefined)
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
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
          return this.$axios.patch(relationUrl, { system_users: newData }).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
          })
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
          return this.$axios.patch(relationUrl, { system_users: newData }).then(res => {
            this.$message.success(this.$t('common.deleteSuccessMsg'))
          }).catch(err => {
            this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + err))
          })
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
          key: this.$t('assets.Comment'),
          value: this.object.comment
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
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
