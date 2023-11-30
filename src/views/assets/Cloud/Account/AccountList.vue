<template>
  <GenericListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import {
  ACCOUNT_PROVIDER_ATTRS_MAP, aliyun, aws_china, aws_international, azure, azure_international, baiducloud,
  ctyun_private, fc, gcp, huaweicloud, huaweicloud_private, jdcloud, kingsoftcloud, lan, nutanix, openstack, zstack,
  qcloud, qcloud_lighthouse, qingcloud_private, ucloud, vmware, scp, apsara_stack
} from '../const'

export default {
  name: 'AccountList',
  components: {
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
                    this.$axios.get(`/api/v1/xpack/cloud/accounts/${val.row.id}/test-connective/`).then(res => {
                      this.$message.success(this.$tc('common.TestSuccessMsg'))
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
      }
    }
  },
  methods: {
    createAccount(provider) {
      return () => { this.$router.push({ name: 'AccountCreate', query: { provider: provider }}) }
    }
  }

}
</script>

<style>

</style>
