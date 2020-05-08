<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <DetailCard :items="detailCardItems" />
    </el-col>
    <el-col :span="10">
      <AutoPushCard v-bind="AutoPushConfig" />
      <RelationCard v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>a

<script>
import DetailCard from '@/components/DetailCard'
import RelationCard from '@/components/RelationCard'
import AutoPushCard from './AutoPushCard'

export default {
  name: 'Detail',
  components: {
    DetailCard,
    RelationCard,
    AutoPushCard
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      AutoPushConfig: {
        icon: 'fa-info',
        title: this.$t('assets.quick_update'),
        url: `/api/v1/assets/system-users/${this.object.id}/`,
        content: [
          {
            name: this.$t('assets.auto_push'),
            auto_push: this.object.auto_push
          }
        ]
      },
      systemUserRelationConfig: {
        icon: 'fa-info',
        title: this.$t('assets.command_filter_list'),
        objectsAjax: {
          url: '/api/v1/assets/system-users/'
        },
        hasObjectsId: this.object.system_users,
        performAdd: (items) => {
          // TODO: Orange API 待修复
          const relationUrl = `/api/v1/assets/cmd-filters/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              cmd_filter: objectId,
              systemuser: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          // TODO: Orange API 待修复
          const relationUrl = `/api/v1/assets/cmd-filters/?cmd-filters=${objectId}&systemuser=${itemId}`
          return this.$axios.delete(relationUrl)
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
          key: this.$t('assets.login_mode_display'),
          value: this.object.login_mode_display
        },
        {
          key: 'Sudo',
          value: this.object.sudo
        },
        {
          key: 'Shell',
          value: this.object.shell
        },
        {
          key: this.$t('assets.date_created'),
          value: '暂时没有这个API'
        },
        {
          key: this.$t('assets.created_by'),
          value: '暂时没有这个API'
        }
      ]
    }
  }
}
</script>

<style lang='less' scoped>

</style>
