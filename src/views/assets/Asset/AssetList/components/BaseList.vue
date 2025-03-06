<template>
  <div>
    <el-alert v-if="helpMessage" show-icon type="info">
      <span v-sanitize="helpMessage" class="announcement-main" />
    </el-alert>
    <ListTable
      ref="ListTable"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :draw-props="createProps"
      :header-actions="iHeaderActions"
      :resource="$tc('Asset')"
      :table-config="iTableConfig"
    />
    <PlatformDialog
      :category="category"
      :visible.sync="showPlatform"
      @select-platform="createAsset"
    />
    <AssetBulkUpdateDialog
      v-if="updateSelectedDialogSetting.visible"
      :category="category"
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      @update="handleAssetBulkUpdate"
    />
    <GatewayDialog
      :cell="gatewayCell"
      :port="gatewayPort"
      :visible.sync="gatewayVisible"
    />
    <AccountDiscoverDialog :asset="discoveryDialog.asset" :visible.sync="discoveryDialog.visible" />
    <AccountCreateUpdate
      v-if="showAddDialog"
      :asset="asset"
      :visible.sync="showAddDialog"
      @add="addAccountSuccess"
    />
  </div>
</template>

<script>
import ListTable from '@/components/Table/DrawerListTable'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import PlatformDialog from '../components/PlatformDialog'
import GatewayDialog from '@/components/Apps/GatewayDialog'
import AccountDiscoverDialog from './AccountDiscoverDialog.vue'
import AccountCreateUpdate from '@/components/Apps/AccountListTable/AccountCreateUpdate.vue'
import { getDefaultConfig } from './const'
import { mapState } from 'vuex'

export default {
  components: {
    ListTable,
    GatewayDialog,
    PlatformDialog,
    AccountCreateUpdate,
    AccountDiscoverDialog,
    AssetBulkUpdateDialog
  },
  props: {
    url: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: ''
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    addExtraMoreActions: {
      type: Array,
      default: () => []
    },
    addExtraMoreColActions: {
      type: Array,
      default: () => []
    },
    helpMessage: {
      type: String,
      default: ''
    },
    optionInfo: {
      type: Object,
      default: () => ({})
    },
    // url中需要添加额外的参数
    extraQuery: {
      type: Object,
      default: () => ({})
    },
    defaultColumns: {
      type: Array,
      default: null
    }
  },
  data() {
    const vm = this
    const defaultConfig = getDefaultConfig(vm)

    const recentPlatforms = [
      {
        name: 'linux',
        title: 'Linux',
        callback: () => {
        }
      },
      {
        name: 'windows',
        title: 'Windows',
        callback: () => {
        }
      }
    ]
    const createAction = {
      name: 'create',
      title: 'Create',
      type: 'primary',
      icon: '',
      split: true,
      has: this.headerActions.hasCrate,
      callback: () => {
        this.showPlatform = false
        setTimeout(() => {
          this.showPlatform = true
        }, 100)
      },
      dropdown: recentPlatforms
    }
    return {
      createDrawer: '',
      detailDrawer: () => import('@/views/assets/Asset/AssetDetail/index.vue'),
      drawer: {
        'host': () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        'web': () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        'custom': () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        'cloud': () => import('@/views/assets/Asset/AssetCreateUpdate/CloudCreateUpdate.vue'),
        'device': () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        'database': () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue')
      },
      createProps: {},
      showPlatform: false,
      showAddDialog: false,
      recentPlatforms: recentPlatforms,
      createAction: createAction,
      gatewayPort: 0,
      asset: {},
      gatewayCell: '',
      gatewayVisible: false,
      defaultConfig: defaultConfig['tableConfig'],
      defaultHeaderActions: defaultConfig['defaultHeaderActions'],
      updateSelectedDialogSetting: {
        visible: false,
        category: this.category,
        selectedRows: []
      },
      discoveryDialog: {
        visible: false,
        asset: ''
      }
    }
  },
  computed: {
    ...mapState({
      recentPlatformIds: state => state.assets.recentPlatformIds
    }),
    iTableConfig() {
      return _.merge(this.defaultConfig, this.tableConfig, {
        url: this.url,
        ...(this.category && { category: this.category })
      })
    },
    iHeaderActions() {
      const actions = _.merge({}, this.defaultHeaderActions, this.headerActions)
      if (this.addExtraMoreActions) {
        actions.extraMoreActions = [...actions.extraMoreActions, ...this.addExtraMoreActions]
      }
      const create = this.createAction
      if (create) {
        create.dropdown = this.recentPlatforms
      }
      const extraActions = actions.extraActions || []
      actions.extraActions = [create, ...extraActions]
      // actions.extraActions[0].dropdown = platforms
      return actions
    }
  },
  watch: {
    optionInfo(iNew) {
      this.$set(this.defaultConfig.columnsMeta.gathered_info.formatterArgs, 'info', iNew)
    },
    $route(iNew, old) {
      const tab = iNew.query.tab
      const oldTab = old.query.tab
      if (tab !== oldTab && tab !== 'all') {
        iNew.query.node_id = ''
        this.$router.push(iNew)
      }
    },
    recentPlatformIds(newValue, oldValue) {
      this.setRecentPlatforms()
      // 在这里执行需要的操作
    }
  },
  mounted() {
    this.setRecentPlatforms()
  },
  activated() {
    this.setRecentPlatforms()
  },
  methods: {
    async updateOrCloneAsset(row, action) {
      this.$route.params.id = row.id
      this.$route.params.action = action
      const meta = {
        action: action,
        id: row.id,
        platform: row.platform.id,
        type: row.type.value,
        category: row.category.value,
        row: row,
        payload: row.payload
      }
      await this.$store.dispatch('common/setDrawerActionMeta', meta)
      this.createDrawer = this.drawer[row.category.value]
      setTimeout(() => {
        this.$refs.ListTable.showDrawer(action)
      }, 100)
    },
    createAsset(platform) {
      this.showPlatform = false
      this.createDrawer = this.drawer[platform.category.value]
      const createProps = {
        platform: platform.id,
        type: platform.type.value,
        category: platform.category.value,
        node: this.$route.query?.node || this.$route.query?.node_id || ''
      }
      for (const key in createProps) {
        this.$route.query[key] = createProps[key]
      }
      this.$store.dispatch('common/setDrawerActionMeta', {
        action: 'create',
        ...createProps
      }).then(() => {
        this.$refs.ListTable.showDrawer('create')
      })
    },
    handleAssetBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.ListTable.reloadTable()
    },
    async setRecentPlatforms() {
      const recentPlatforms = await this.$store.dispatch('assets/getRecentPlatforms')
      const allPlatforms = await this.$store.dispatch('assets/getPlatforms')
      const otherPlatforms = allPlatforms.filter(item => !this.recentPlatformIds.includes(item.id))
      let platforms = [...recentPlatforms, ...otherPlatforms]
      if (this.category !== 'all') {
        platforms = platforms.filter(item => item.category.value === this.category)
      }
      platforms = platforms.slice(0, 6)
      const vm = this
      platforms = platforms.map(item => {
        return {
          name: item.name,
          title: item.name,
          callback: () => {
            vm.createAsset(item)
          }
        }
      })
      this.recentPlatforms = platforms
    },
    addAccountSuccess() {
      this.$refs.ListTable.reloadTable()
    }
  }
}
</script>
