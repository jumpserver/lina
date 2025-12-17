<template>
  <div>
    <SmallCard ref="table" class="account-table" v-bind="table" />
    <CreateDialog
      v-if="visible"
      :visible.sync="visible"
      v-bind="providerConfig"
    />
    <UpdateDialog
      v-if="updateVisible"
      :object="object"
      :visible.sync="updateVisible"
      @submitSuccess="onSubmitSuccess"
    />
    <SyncDialog
      v-if="onlineSyncVisible"
      :object="object"
      :visible.sync="onlineSyncVisible"
    />
  </div>
</template>

<script lang="jsx">
import { lan, privateCloudProviders, publicHostProviders, publicDBProviders } from '../const'
import CreateDialog from './components/CreateDialog.vue'
import UpdateDialog from './components/UpdateDialog.vue'
import SyncDialog from './components/SyncDialog.vue'
import SmallCard from '@/components/Table/InfoCardTable/index.vue'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'
import { toSafeLocalDateStr } from '@/utils/common/time'

export default {
  name: 'CloudAccountList',
  components: {
    SyncDialog,
    SmallCard,
    CreateDialog,
    UpdateDialog
  },
  data() {
    const vm = this
    return {
      object: null,
      table: {
        tableConfig: {
          url: '',
          permissions: {
            app: 'xpack',
            resource: 'account'
          },
          extraQuery: {}
        },
        subComponentProps: {
          handleUpdate: (obj) => {
            this.object = obj
            this.updateVisible = true
          },
          getImage: (obj) => {
            return ACCOUNT_PROVIDER_ATTRS_MAP[obj.provider.value].image
          },
          getInfos: (obj) => {
            return [
              {
                title: this.$tc('TotalSyncRegion'),
                content: obj?.task.regions.length
              },
              {
                title: this.$tc('TotalSyncAsset'),
                content: obj?.task.instance_count
              },
              {
                title: this.$tc('DateLastSync'),
                content: toSafeLocalDateStr(obj?.task.date_last_sync)
              }
            ]
          },
          actions: [
            {
              id: 'online-sync',
              name: this.$tc('SyncOnline'),
              icon: 'el-icon-thumb',
              callback: this.handleOnlineExecute,
              disabled: !this.$hasPerm('xpack.change_syncinstancetask')
            }
          ]
        },
        headerActions: {
          hasImport: false,
          hasExport: false,
          hasColumnSetting: false,
          hasMoreActions: false,
          searchConfig: {
            getUrlQuery: false
          },
          moreCreates: {
            loading: false,
            callback: (option) => {
              vm.$router.push({ name: 'AccountCreate', query: { provider: option.name } })
            },
            dropdown: [
              {
                name: 'publicCloud',
                title: this.$t('PublicCloud'),
                icon: 'public-cloud',
                callback: () => {
                  const providers = this.iCategory === 'host' ? publicHostProviders : publicDBProviders
                  this.providerConfig.providers = providers.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              },
              {
                name: 'privateCloud',
                title: this.$t('PrivateCloud'),
                icon: 'private-cloud',
                has: () => this.iCategory === 'host',
                callback: () => {
                  this.providerConfig.providers = privateCloudProviders.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              },
              {
                name: 'LAN',
                title: this.$t('LAN'),
                icon: 'computer',
                has: () => this.iCategory === 'host',
                callback: () => {
                  const providers = [lan]
                  this.providerConfig.providers = providers.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              }
            ]
          }
        },
        detailDrawer: () => import('@/views/assets/Cloud/Account/AccountDetail/index.vue')
      },
      providerConfig: {
        providers: []
      },
      visible: false,
      updateVisible: false,
      onlineSyncVisible: false
    }
  },
  computed: {
    iCategory() {
      return this.$route.query.category || 'host'
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (!val) {
          this.$refs.table.reloadTable()
        }
      }
    },
    onlineSyncVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$refs.table.reloadTable()
        }
      }
    },
    updateVisible: {
      handler(newValue) {
        if (newValue === false) {
          this.$refs.table.reloadTable()
        }
      }
    }
  },
  mounted() {
    this.table.tableConfig.url = '/api/v1/xpack/cloud/accounts/'
    this.table.tableConfig.extraQuery = { category: this.iCategory }
  },
  methods: {
    valid(status) {
      if (status !== 200) {
        this.$message.error(this.$tc('TestAccountConnectionError'))
        return 200
      }
      return status
    },
    handleOnlineExecute(obj) {
      this.object = obj
      this.onlineSyncVisible = true
    },
    onSubmitSuccess() {
      this.$refs.table.reloadTable()
      this.updateVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>

</style>
