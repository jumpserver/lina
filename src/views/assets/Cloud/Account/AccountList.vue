<template>
  <div>
    <SmallCard ref="table" v-bind="$data" />
    <CreateDialog v-if="visible" :visible.sync="visible" v-bind="providerConfig" />
    <Dialog
      v-if="updateVisible"
      :destroy-on-close="true"
      :show-buttons="false"
      :title="$tc('CloudAccountUpdate')"
      :visible.sync="updateVisible"
      v-on="$listeners"
    >
      <AuthPanel
        :object="object"
        :provider="object.provider.value"
        :visible.sync="updateVisible"
        origin="update"
        @submitSuccess="onSubmitSuccess"
      />
    </Dialog>
    <Dialog
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :destroy-on-close="true"
      :show-buttons="false"
      :show-close="false"
      :title="$tc('SyncOnline')"
      :visible.sync="onlineSyncVisible"
      v-on="$listeners"
    >
      <AssetPanel :object="object" :visible.sync="onlineSyncVisible" />
    </Dialog>
  </div>
</template>

<script type="text/jsx">
import {
  aliyun, apsara_stack, aws_china, aws_international, azure, azure_international,
  baiducloud, state_private, fc, gcp, huaweicloud, huaweicloud_private, jdcloud, kingsoftcloud, lan, nutanix, openstack,
  qcloud, qcloud_lighthouse, qingcloud_private, scp, ucloud, vmware, volcengine, zstack
} from '../const'
import CreateDialog from './components/CreateDialog.vue'
import SmallCard from '@/components/Table/CardTable/DataCardTable/index.vue'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'
import Dialog from '@/components/Dialog/index.vue'
import AssetPanel from './components/AssetPanel.vue'
import AuthPanel from './components/AuthPanel.vue'
import { toSafeLocalDateStr } from '@/utils/time'

export default {
  name: 'CloudAccountList',
  components: {
    AuthPanel,
    AssetPanel,
    Dialog,
    SmallCard,
    CreateDialog
  },
  data() {
    const vm = this
    return {
      object: null,
      tableConfig: {
        url: '/api/v1/xpack/cloud/accounts/',
        permissions: {
          app: 'xpack',
          resource: 'account'
        }
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
                const providers = [
                  aliyun, qcloud, qcloud_lighthouse, huaweicloud,
                  baiducloud, jdcloud, kingsoftcloud, aws_china,
                  aws_international, azure, azure_international,
                  gcp, ucloud, volcengine
                ]
                this.providerConfig.providers = providers.map(
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
                const providers = [
                  vmware, qingcloud_private, huaweicloud_private, state_private,
                  openstack, zstack, nutanix, fc, scp, apsara_stack
                ]
                this.providerConfig.providers = providers.map(
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
      },
      providerConfig: {
        providers: []
      },
      visible: false,
      updateVisible: false,
      onlineSyncVisible: false,
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
      }
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
