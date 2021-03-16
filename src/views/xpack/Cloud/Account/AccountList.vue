<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
import { ACCOUNT_PROVIDER_ATTRS_MAP, aliyun, aws_china, aws_international, huaweicloud, qcloud, azure, vmware } from '../const'
import { BooleanFormatter, DetailFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/cloud/accounts/',
        columns: [
          'name', 'provider', 'validity', 'date_created', 'comment', 'actions'
        ],
        columnsMeta: {
          name: {
            prop: 'name',
            sortable: true,
            showOverflowTooltip: true,
            formatter: DetailFormatter,
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
                  callback: function(val) {
                    this.$axios.get(`/api/v1/xpack/cloud/accounts/${val.row.id}/test-connective/`).then(res => {
                      this.$message.success(this.$t('common.TestSuccessMsg'))
                    })
                  }
                }
              ]
            }
          },
          validity: {
            width: '90px',
            align: 'center',
            formatter: BooleanFormatter,
            formatterArgs: {
              iconChoices: {
                false: 'fa-times text-danger',
                true: 'fa-check text-primary'
              }
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasMoreActions: false,
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'AccountCreate', query: { provider: option.name }})
          },
          dropdown: [
            {
              name: aliyun,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[aliyun].title,
              type: 'primary',
              can: true
            },
            {
              name: qcloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[qcloud].title,
              type: 'primary',
              can: true
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
              name: huaweicloud,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[huaweicloud].title
            },
            {
              name: azure,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[azure].title
            },
            {
              name: vmware,
              title: ACCOUNT_PROVIDER_ATTRS_MAP[vmware].title
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
