<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun, aws_china, aws_international, huaweicloud, qcloud, azure, azure_international, vmware, nutanix, qingcloud_private, huaweicloud_private, openstack, gcp, baiducloud, jdcloud, fc } from '../const'

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
        columns: [
          'name', 'provider', 'validity', 'date_created', 'comment', 'actions'
        ],
        columnsMeta: {
          name: {
            sortable: true,
            showOverflowTooltip: true,
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
                vm.$router.push({ name: 'AccountUpdate', params: { id: row.id }, query: { provider: row.provider }})
              },
              extraActions: [
                {
                  name: 'TestConnection',
                  title: this.$t('assets.TestConnection'),
                  can: () => vm.$hasPerm('xpack.test_account'),
                  callback: function(val) {
                    this.$axios.get(`/api/v1/xpack/cloud/accounts/${val.row.id}/test-connective/`).then(res => {
                      this.$message.success(this.$t('common.TestSuccessMsg'))
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
              name: openstack,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[openstack].title
            },
            {
              name: nutanix,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[nutanix].title
            },
            {
              name: fc,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[fc].title
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
