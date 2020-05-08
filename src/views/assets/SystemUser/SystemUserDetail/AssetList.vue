<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <AutoPushCard v-bind="AutoPushConfig" />
      <RelationCard v-bind="systemUserRelationConfig" />
    </el-col>
  </el-row>
</template>a

<script>

import RelationCard from '@/components/RelationCard'
import AutoPushCard from './AutoPushCard'
import ListTable from '@/components/ListTable/index'
import { ActionsFormatter } from '@/components/ListTable/formatters'

export default {
  name: 'Detail',
  components: {
    ListTable,
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
      },
      tableConfig: {
        url: `/api/v1/assets/asset-users/?prefer_id=${this.object.id}&prefer=system_user&latest=1`,
        columns: [
          {
            prop: 'hostname',
            label: this.$t('assets.hostname')
          },
          {
            prop: 'ip',
            label: this.$t('assets.ip')
          },
          {
            prop: 'username',
            label: this.$t('assets.username')
          },
          {
            prop: 'version',
            label: this.$t('assets.version')
          },
          {
            prop: 'action.date_created',
            label: this.$t('assets.date_created')
          },
          {
            prop: 'id',
            label: this.$tco('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                // http://localhost/api/v1/assets/cmd-filters/04a70dd5-62b3-4d05-8ebf-220e00a8072a/rules/dba77c52-8613-4762-a9cd-55093211c738/
                const url = `/api/v1/assets/cmd-filters/${this.object.id}/rules/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasBulkDelete: false,
        hasSearch: true,
        hasCreate: false
      }
    }
  },
  computed: {

  }
}
</script>

<style lang='less' scoped>

</style>
d
