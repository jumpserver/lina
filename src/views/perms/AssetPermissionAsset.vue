<template>
  <el-row :gutter="20">
    <el-col :span="14">
      <ListTable :table-config="tableConfig" :header-actions="headerActions" />
    </el-col>
    <el-col :span="10">
      <el-card class="box-card primary">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ assetCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectAsset.value" v-bind="selectAsset" />
        </div>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card success">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ nodeCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectNode.value" v-bind="selectNode" />
        </div>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card warning">
        <div slot="header" class="clearfix">
          <i class="fa fa-info" />
          <span>{{ systemUserCardActions }}</span>
        </div>
        <div>
          <Select2 v-model="selectSystemUser.value" v-bind="selectSystemUser" />
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/ListTable'
import Select2 from '@/components/Select2'

export default {
  name: 'AssetPermissionAsset',
  components: {
    ListTable,
    Select2
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/${this.$route.params.id}/assets/all/`,
        columns: [
          'asset_display'
        ],
        columnsMeta: {
          asset_display: {
            label: this.$t('perms.Asset')
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      },
      assetPermissionAsset: [],
      assetPermissionNode: [],
      assetPermissionSystemUser: [],
      selectAsset: {
        url: '/api/v1/assets/assets/',
        initial: this.assetPermissionAsset,
        value: []
      },
      selectNode: {
        url: '/api/v1/assets/nodes/',
        initial: this.assetPermissionNode,
        value: []
      },
      selectSystemUser: {
        url: '/api/v1/assets/system-users/',
        initial: this.assetPermissionSystemUser,
        value: []
      }
    }
  },
  computed: {
    assetCardActions() {
      return this.$t('perms.Asset')
    },
    nodeCardActions() {
      return this.$t('perms.Node')
    },
    systemUserCardActions() {
      return this.$t('perms.SystemUser')
    }
  }
}
</script>

<style scoped>

</style>
