<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script type="text/jsx">
import GenericListTable from '@/layout/components/GenericListTable'
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
              onUpdate: ({ row, col }) => {
                if (row.provider === 'azure') {
                  vm.$router.push({ name: 'AzureAccountUpdate', params: { id: row.id }})
                } else {
                  vm.$router.push({ name: 'AccountUpdate', params: { id: row.id }})
                }
              }
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
        hasCreate: false,
        moreActionsTitle: this.$t('common.Create'),
        moreActionsType: 'primary',
        extraMoreActions: [
          {
            name: 'aliyun',
            title: this.$t('xpack.Cloud.Aliyun'),
            type: 'primary',
            can: true,
            callback: this.createAliyun.bind(this)
          }, {
            name: 'qcloud',
            title: this.$t('xpack.Cloud.Qcloud'),
            type: 'primary',
            can: true,
            callback: this.createQcloud.bind(this)
          }, {
            name: 'AWS_China',
            title: this.$t('xpack.Cloud.AWS_China'),
            type: 'primary',
            can: true,
            callback: this.createAwsChina.bind(this)
          },
          {
            name: 'AWS_Int',
            title: this.$t('xpack.Cloud.AWS_Int'),
            type: 'primary',
            can: true,
            callback: this.createAwsInt.bind(this)
          }, {
            name: 'HuaweiCloud',
            title: this.$t('xpack.Cloud.HuaweiCloud'),
            type: 'primary',
            can: true,
            callback: this.createhuawei.bind(this)
          }, {
            name: 'Azure',
            title: this.$t('xpack.Cloud.Azure'),
            type: 'primary',
            can: true,
            callback: this.createAzure.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    createAzure() {
      this.$router.push({ name: 'AzureAccountCreate', query: { provider: 'azure' }})
    },
    createAliyun() {
      this.$router.push({ name: 'AccountCreate', query: { provider: 'aliyun' }})
    },
    createQcloud() {
      this.$router.push({ name: 'AccountCreate', query: { provider: 'qcloud' }})
    },
    createAwsChina() {
      this.$router.push({ name: 'AccountCreate', query: { provider: 'aws_china' }})
    },
    createAwsInt() {
      this.$router.push({ name: 'AccountCreate', query: { provider: 'aws_international' }})
    },
    createhuawei() {
      this.$router.push({ name: 'AccountCreate', query: { provider: 'huaweicloud' }})
    }
  }
}
</script>

<style>

</style>
