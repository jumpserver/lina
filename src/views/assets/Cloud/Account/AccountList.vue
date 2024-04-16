<template>
  <div>
    <GenericListTable ref="regionTable" :header-actions="headerActions" :table-config="tableConfig" />
    <Dialog
      :title="$tc('assets.TestConnection')"
      :visible.sync="visible"
      :confirm-title="$tc('assets.TestConnection')"
      :loading-status="testLoading"
      width="50"
      @close="handleCancel()"
      @cancel="handleCancel()"
      @confirm="handleConfirm()"
    >
      <el-form ref="regionForm" label-width="auto" :model="account">
        <el-form-item :label="$tc('xpack.Cloud.Region')" :rules="regionRules" prop="region">
          <Select2 ref="regionSelect" v-model="account.region" v-bind="select2" />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script type="text/jsx">
import {
  ACCOUNT_PROVIDER_ATTRS_MAP, aliyun, aws_china, aws_international, azure, azure_international, baiducloud,
  ctyun_private, fc, gcp, huaweicloud, huaweicloud_private, jdcloud, kingsoftcloud, lan, nutanix, openstack, zstack,
  qcloud, qcloud_lighthouse, qingcloud_private, ucloud, vmware, scp, apsara_stack, volcengine
} from '../const'
import rules from '@/components/Form/DataForm/rules'
import { Select2 } from '@/components/Form/FormFields'
import GenericListTable from '@/layout/components/GenericListTable'
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'AccountList',
  components: {
    Dialog,
    Select2,
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/accounts/',
        permissions: {
          app: 'xpack',
          resource: 'account'
        },
        columnsExclude: ['attrs'],
        columnsShow: {
          default: [
            'name', 'provider', 'comment', 'validity', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            sortable: true,
            formatterArgs: {
              route: 'AccountDetail'
            }
          },
          provider: {
            width: '120px'
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountUpdate',
              hasClone: false,
              onUpdate: ({ row, col }) => {
                vm.$router.push({ name: 'AccountUpdate', params: { id: row.id }, query: { provider: row.provider?.value }})
              },
              extraActions: [
                {
                  name: 'TestConnection',
                  title: this.$t('assets.TestConnection'),
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
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasMoreActions: false,
        searchConfig: {
          getUrlQuery: false
        },
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'AccountCreate', query: { provider: option.name }})
          },
          dropdown: [
            {
              name: aliyun,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[aliyun].title,
              type: 'primary',
              group: this.$t('common.PublicCloud'),
              can: true
            },
            {
              name: qcloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[qcloud].title,
              type: 'primary',
              can: true
            },
            {
              name: qcloud_lighthouse,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[qcloud_lighthouse].title
            },
            {
              name: huaweicloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[huaweicloud].title
            },
            {
              name: baiducloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[baiducloud].title
            },
            {
              name: jdcloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[jdcloud].title
            },
            {
              name: kingsoftcloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[kingsoftcloud].title
            },
            {
              name: aws_china,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[aws_china].title
            },
            {
              name: aws_international,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[aws_international].title
            },
            {
              name: azure,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[azure].title
            },
            {
              name: azure_international,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[azure_international].title
            },
            {
              name: gcp,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[gcp].title
            },
            {
              name: ucloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[ucloud].title
            },
            {
              name: volcengine,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[volcengine].title
            },
            {
              name: vmware,
              group: this.$t('common.PrivateCloud'),
              title: ACCOUNT_PROVIDER_ATTRS_MAP[vmware].title
            },
            {
              name: qingcloud_private,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[qingcloud_private].title
            },
            {
              name: huaweicloud_private,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[huaweicloud_private].title
            },
            {
              name: ctyun_private,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[ctyun_private].title
            },
            {
              name: openstack,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[openstack].title
            },
            {
              name: zstack,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[zstack].title
            },
            {
              name: nutanix,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[nutanix].title
            },
            {
              name: fc,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[fc].title
            },
            {
              name: scp,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[scp].title
            },
            {
              name: apsara_stack,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[apsara_stack].title
            },
            {
              name: lan,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[lan].title
            }
          ]
        }
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
        this.$message.error(this.$t('xpack.Cloud.AccountTestConnectionError'))
        return 200
      }
      return status
    },
    handleCancel() {
      this.visible = false
      this.$refs.regionSelect.clearSelected()
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
