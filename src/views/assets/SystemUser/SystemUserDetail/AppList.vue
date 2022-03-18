<template>
  <div>
    <el-row :gutter="20">
      <el-col :md="16" :sm="24">
        <ListTable ref="ListTable" :table-config="tableConfig" :header-actions="headerActions" />
      </el-col>
      <el-col :md="8" :sm="24">
        <RelationCard ref="assetSelect" type="primary" style="margin-top: 15px" v-bind="appRelationConfig" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import ListTable from '@/components/ListTable'
import { DetailFormatter } from '@/components/TableFormatters'
import RelationCard from '@/components/RelationCard'

export default {
  name: 'AssetList',
  components: {
    RelationCard,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        name: 'AppList',
        url: `/api/v1/applications/system-users-apps-relations/?systemuser=${this.object.id}`,
        columns: ['app_display', 'actions'],
        columnsMeta: {
          app_display: {
            label: this.$t('applications.App'),
            showOverflowTooltip: true,
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute({ row }) {
                const categoryRouteMapper = {
                  'remote_app': 'RemoteAppDetail',
                  'db': 'DatabaseAppDetail',
                  'cloud': 'KubernetesAppDetail'
                }
                const name = categoryRouteMapper[row.category]
                return {
                  name: name,
                  params: { id: row.app }
                }
              }
            }
          },
          actions: {
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: false,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  type: 'danger',
                  can: !this.$store.getters.currentOrgIsRoot,
                  callback: (val) => {
                    this.$axios.delete(`/api/v1/applications/system-users-apps-relations/${val.row.id}/`).then(() => {
                      this.$message.success(this.$t('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasBulkDelete: false,
        hasImport: false,
        hasCreate: false
      },
      appRelationConfig: {
        icon: 'fa-edit',
        title: this.$t('applications.associateApplication'),
        disabled: this.$store.getters.currentOrgIsRoot,
        objectsAjax: {
          url: `/api/v1/applications/applications/?type=${vm.object.protocol}`,
          transformOption: (item) => {
            return { label: item.name + ' (' + item.type_display + ')', value: item.id }
          }
        },
        showHasObjects: false,
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/applications/system-users-apps-relations/`
          const appsId = items.map(v => v.value)
          const data = []
          for (const appId of appsId) {
            data.push({ systemuser: objectId, app: appId })
          }
          return this.$axios.post(relationUrl, data)
        },
        onAddSuccess: (objects, that) => {
          this.$log.debug('Select value', that.select2.value)
          that.iHasObjects = [...that.iHasObjects, ...objects]
          that.$refs.select2.clearSelected()
          this.$message.success(this.$t('common.updateSuccessMsg'))
          this.$refs.ListTable.reloadTable()
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style lang='less' scoped>

</style>
