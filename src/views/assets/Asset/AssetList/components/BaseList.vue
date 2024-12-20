<template>
  <div>
    <el-alert v-if="helpMessage" show-icon type="info">
      <span v-sanitize="helpMessage" class="announcement-main" />
    </el-alert>
    <ListTable
      ref="ListTable"
      :create-drawer="createDrawer"
      :header-actions="iHeaderActions"
      :table-config="iTableConfig"
    />
    <PlatformDialog :category="category" :visible.sync="showPlatform" @select-platform="createAsset" />
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
  </div>
</template>

<script>
import ListTable from '@/components/Table/DrawerListTable'
import AssetBulkUpdateDialog from './AssetBulkUpdateDialog'
import PlatformDialog from '../components/PlatformDialog'
import GatewayDialog from '@/components/Apps/GatewayDialog'
import AccountDiscoverDialog from './AccountDiscoverDialog.vue'
import { getDefaultConfig } from './const'

export default {
  components: {
    ListTable,
    GatewayDialog,
    PlatformDialog,
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
    }
  },
  data() {
    const vm = this
    const defaultConfig = getDefaultConfig(vm)
    console.log('Default config: ', defaultConfig)

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
      callback: () => {
        this.showPlatform = true
      },
      dropdown: recentPlatforms
    }
    return {
      createDrawer: '',
      drawer: {
        'host': () => import('@/views/assets/Asset/AssetCreateUpdate/HostCreateUpdate.vue'),
        'web': () => import('@/views/assets/Asset/AssetCreateUpdate/WebCreateUpdate.vue'),
        'custom': () => import('@/views/assets/Asset/AssetCreateUpdate/CustomCreateUpdate.vue'),
        'cloud': () => import('@/views/assets/Asset/AssetCreateUpdate/CloudsPlatformCreateUpdate.vue'),
        'device': () => import('@/views/assets/Asset/AssetCreateUpdate/DeviceCreateUpdate.vue'),
        'database': () => import('@/views/assets/Asset/AssetCreateUpdate/DatabaseCreateUpdate.vue')
      },
      showPlatform: false,
      recentPlatforms: recentPlatforms,
      createAction: createAction,
      gatewayPort: 0,
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
      // if (this.extraActions) {
      //   actions.extraActions = [...actions.extraActions, ...this.extraActions]
      // }
      const create = this.createAction
      if (create) {
        create.dropdown = this.recentPlatforms
      }
      const extraActions = actions.extraActions || []
      actions.extraActions = [create, ...extraActions]
      // actions.extraActions[0].dropdown = platforms
      console.log('Actions: ', actions)
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
    }
  },
  mounted() {
  },
  activated() {
    this.setRecentPlatforms()
  },
  methods: {
    createAsset(platform) {
      this.createDrawer = this.drawer[platform.category.value]
      setTimeout(() => {
        this.$refs.ListTable.onCreate()
      }, 200)
      // const route = _.capitalize(platform.category.value) + 'Create' || 'HostCreate'
      // this.iVisible = false
      // const query = {
      //   node: this.$route.query?.node || this.$route.query?.node_id || '',
      //   platform: platform.id,
      //   type: platform.type.value,
      //   category: platform.category.value
      // }
      //
      // const router = { name: route, query }
      // if (this.$route.query.node_id) {
      //   const { href } = this.$router.resolve(router)
      //   window.open(href, '_blank')
      // } else {
      //   this.$router.push(router)
      // }
    },
    handleAssetBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.ListTable.reloadTable()
    },
    async setRecentPlatforms() {
      const recentPlatforms = await this.$store.dispatch('assets/getRecentPlatforms')
      const recentIds = recentPlatforms.map(item => item.id)
      let allPlatforms = await this.$store.dispatch('assets/getPlatforms')
      allPlatforms = allPlatforms.filter(item => !recentIds.includes(item.id))
      let platforms = [...recentPlatforms, ...allPlatforms]
      if (this.category !== 'all') {
        platforms = platforms.filter(item => item.category.value === this.category)
      }
      platforms = platforms.slice(0, 6)
      platforms = platforms.map(item => {
        return {
          name: item.name,
          title: item.name,
          callback: () => {
            this.showPlatform = true
          }
        }
      })
      this.recentPlatforms = platforms
    }
  }
}
</script>
