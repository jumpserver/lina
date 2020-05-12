<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="nodeReletionConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable/index'
import { CustomActionsFormatter, DateFormatter } from '@/components/ListTable/formatters'
import QuickActions from '@/components/QuickActions/index'
import RelationCard from '@/components/RelationCard'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    ListTable,
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
      quickActions: [
        {
          title: this.$t('assets.TestAssetsConnective'),
          attrs: {
            type: 'primary',
            label: this.$tc('Test')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'test' }
              ).then(res => {
                window.open(`/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        },
        {
          title: this.$t('assets.PushSystemUserNow'),
          attrs: {
            type: 'primary',
            label: this.$tc('Push')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `api/v1/assets/system-users/${this.object.id}/tasks/`,
                { action: 'push' }
              ).then(res => {
                window.open(`/ops/celery/task/${res.task}/log/`, '', 'width=900,height=600')
              }
              )
            }.bind(this)
          }
        }
      ],
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
            prop: 'date_created',
            label: this.$t('assets.date_created'),
            formatter: DateFormatter
          },
          {
            prop: 'id',
            align: 'center',
            formatter: CustomActionsFormatter,
            actions: {
              extraActions: [
                {
                  name: this.$tc('delete'),
                  title: this.$tc('delete'),
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/assets/asset-users/${val.cellValue}/`).then(
                      this.$refs.ListTable.reloadTable()
                    )
                  }
                },
                {
                  name: this.$tc('Test'),
                  title: this.$tc('Test'),
                  callback: (val) => {
                    console.log('Test')
                  }
                },
                {
                  name: this.$tc('Push'),
                  title: this.$tc('Push'),
                  callback: (val) => {
                    console.log('Push')
                  }
                }
              ]
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasSearch: true,
        hasCreate: false
      },
      nodeReletionConfig: {
        icon: 'fa-info',
        title: this.$t('perms.Add node to this permission'),
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
        hasObjectsId: [],
        hasObjects: [],
        performAdd: (items) => {
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              systemuser: objectId,
              node: v.value
            }
          })
          return this.$axios.post(relationUrl, data)
        },
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/assets/system-users-nodes-relations/?systemuser=${objectId}&node=${itemId}`
          return this.$axios.delete(relationUrl)
        }
      }
    }
  },
  computed: {

  },
  mounted() {
    this.getNodeList()
  },
  methods: {
    getNodeList() {
      this.$axios.get(
        `/api/v1/assets/system-users-nodes-relations/?systemuser=${this.object.id}&draw=1&limit=15&offset=0`
      ).then(data => {
        for (const x in data.results) {
          this.nodeReletionConfig.hasObjectsId.push(data.results[x].node)
          this.nodeReletionConfig.hasObjects.push({
            value: data.results[x].node,
            label: data.results[x].node_display
          })
        }
      }
      )
    }
  }
}
</script>

<style lang='less' scoped>

</style>
