<template>
  <div>
    <CardTable ref="accountTable" :sub-component="subComponent" v-bind="$data" />
    <CreateDialog
      v-if="visible"
      v-bind="providerConfig"
      :visible.sync="visible"
    />
  </div>
</template>

<script type="text/jsx">
import {
  aliyun, apsara_stack, aws_china, aws_international, azure, azure_international,
  baiducloud, state_private, fc, gcp, huaweicloud, huaweicloud_private, jdcloud, kingsoftcloud, lan, nutanix, openstack,
  qcloud, qcloud_lighthouse, qingcloud_private, scp, ucloud, vmware, volcengine, zstack
} from '../const'
import rules from '@/components/Form/DataForm/rules'
import CreateDialog from './components/CreateDialog.vue'
import CardTable from '@/components/Table/CardTable'
import AccountPanel from './components/AccountPanel'
import { ACCOUNT_PROVIDER_ATTRS_MAP } from '@/views/assets/Cloud/const'

export default {
  name: 'CloudAccountList',
  components: {
    CardTable,
    CreateDialog
  },
  data() {
    const vm = this
    return {
      colWidth: 6,
      subComponent: AccountPanel,
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
      account: {},
      visible: false,
      testLoading: false,
      select2: {
        allowCreate: true,
        multiple: false
      },
      regionRules: [rules.Required]
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (!val) {
          this.$refs.accountTable.reloadTable()
        }
      }
    }
  },
  activated() {
    this.$refs.accountTable.reloadTable()
  },
  methods: {
    valid(status) {
      if (status !== 200) {
        this.$message.error(this.$tc('TestAccountConnectionError'))
        return 200
      }
      return status
    }
  }
}
</script>

<style>

</style>
