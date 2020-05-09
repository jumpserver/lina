<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <RelationCard ref="RelationCard" type="info" style="margin-top: 15px" v-bind="nodeReletionConfig" />
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
      nodeReletionConfig: {
        icon: 'fa-info',
        title: this.$t('assets.Replace node assets admin user with this'),
        objectsAjax: {
          url: '/api/v1/assets/nodes/',
          processResults(data) {
            let results = data.results
            results = results.map((item) => {
              return { label: item.full_value, value: item.id }
            })
            const more = !!data.next
            return { results: results, pagination: more, total: data.count }
          }
        },
        performAdd: (items) => {
          const data = []
          const relationUrl = `/api/v1/assets/admin-users/${this.object.id}/nodes/`
          items.map(v => {
            data.push(v.value)
          })
          return this.$axios.patch(relationUrl, { nodes: data }).then(res => {
            this.$message.success(this.$tc('Update success'))
          }).catch(err => {
            this.$message.error(this.$tc('Update failed' + ' ' + err))
          })
        },
        onAddSuccess: () => {
          console.log(this)
          this.$refs.RelationCard.$refs.select2.clearSelected()
        }
      }
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          key: this.$t('assets.name'),
          value: this.object.name
        },
        {
          key: this.$t('assets.username'),
          value: this.object.username
        },
        {
          key: this.$t('assets.date_created'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('assets.created_by'),
          value: this.object.created_by
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
