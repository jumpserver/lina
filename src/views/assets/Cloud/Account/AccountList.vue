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
      :visible.sync="onlineSyncVisible"
    />
  </div>
</template>

<script type="text/jsx">
import { lan, privateCloudProviders, publicCloudProviders } from '../const'
import CreateDialog from './components/CreateDialog.vue'
import UpdateDialog from './components/UpdateDialog.vue'
import SyncDialog from './components/SyncDialog.vue'
import SmallCard from '@/components/Table/CardTable/DataCardTable/index.vue'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'
import { toSafeLocalDateStr } from '@/utils/time'

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
          url: '/api/v1/xpack/cloud/accounts/',
          permissions: {
            app: 'xpack',
            resource: 'account'
          }
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
              vm.$router.push({ name: 'AccountCreate', query: { provider: option.name }})
            },
            dropdown: [
              {
                name: 'publicCloud',
                title: this.$t('PublicCloud'),
                icon: 'public-cloud',
                callback: () => {
                  this.providerConfig.providers = publicCloudProviders.map(
                    (item) => ACCOUNT_PROVIDER_ATTRS_MAP[item]
                  )
                  this.visible = true
                }
              },
              {
                name: 'privateCloud',
                icon: 'private-cloud',
                title: this.$t('PrivateCloud'),
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
        }
      },
      providerConfig: {
        providers: []
      },
      visible: false,
      updateVisible: false,
      onlineSyncVisible: false
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

.account-table {
  ::v-deep {
    .panel-content {
      padding: 30px 0;
    }
  }
}

</style>
