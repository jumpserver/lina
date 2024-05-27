<template>
  <div>
    <CardTable ref="regionTable" :sub-component="subComponent" v-bind="$data" />
    <CreateDialog
      v-if="providerConfig.visible"
      v-bind="providerConfig"
      :visible.sync="providerConfig.visible"
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
import { openTaskPage } from '@/utils/jms'
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
        },
        columnsMeta: {
          actions: {
            formatterArgs: {
              extraActions: [
                {
                  name: 'TestConnection',
                  title: this.$t('TestConnection'),
                  can: () => vm.$hasPerm('xpack.test_account'),
                  callback: function(val) {
                    this.$axios.get(
                      `/api/v1/xpack/cloud/regions/?account_id=${val.row.id}`,
                      { disableFlashErrorMsg: true }
                    ).then(resp => {
                      vm.visible = true
                      vm.account.id = val.row.id
                      vm.select2.options = resp.regions.map(r => ({ 'label': r.name, 'value': r.id }))
                    }).catch(err => {
                      vm.$message.error(err.response.data.msg)
                    })
                  }
                },
                {
                  title: vm.$t('RunTaskManually'),
                  name: 'execute',
                  type: 'info',
                  can: () => vm.$hasPerm('xpack.add_syncinstancetaskexecution'),
                  callback: function(data) {
                    const taskId = data.row.task?.id
                    if (taskId) {
                      this.$axios.get(`/api/v1/xpack/cloud/sync-instance-tasks/${taskId}/run/`).then(res => {
                        openTaskPage(res['task'])
                      })
                    } else {
                      this.$message.error(this.$t('ExecCloudSyncErrorMsg'))
                    }
                  }
                }
              ]
            }
          }
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
                this.providerConfig.visible = true
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
                this.providerConfig.visible = true
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
                this.providerConfig.visible = true
              }
            }
          ]
        }
      },
      providerConfig: {
        visible: false,
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
  methods: {
    valid(status) {
      if (status !== 200) {
        this.$message.error(this.$tc('TestAccountConnectionError'))
        return 200
      }
      return status
    },
    handleConfirm() {
      this.$refs.regionForm.validate(valid => {
        if (valid) {
          this.testLoading = true
          this.$axios.get(
            `/api/v1/xpack/cloud/accounts/${this.account.id}/test-connective/?region_id=${this.account.region}`,
            { disableFlashErrorMsg: true }
          ).then((resp) => {
            this.$message.success(resp.msg)
          }).catch(error => {
            this.$message.error(error.response.msg)
          }).finally(() => {
            this.testLoading = false
            this.$refs.regionTable.reloadTable()
          })
        } else {
          return false
        }
      })
    }
  }

}
</script>

<style>

</style>
