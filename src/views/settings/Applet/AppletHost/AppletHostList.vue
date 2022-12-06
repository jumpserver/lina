<template>
  <ListTable class="applet-host" v-bind="$data" />
</template>

<script>
import { ListTable } from '@/components'
export default {
  name: 'AppletHost',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/applet-hosts/',
        columns: [
          'name', 'address', 'protocols', 'load', 'comment',
          'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'address', 'protocols', 'load',
            'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'AppletHostDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          load: {
            formatterArgs: {
              classChoices: {
                '': 'success',
                offline: 'fa fa-chain-broken text-danger',
                critical: 'fa fa-bolt text-warning',
                high: 'fa fa-exclamation-triangle text-info',
                normal: 'fa fa-check text-primary'
              }
            }
          },
          protocols: {
            label: this.$t('assets.Protocols'),
            formatter: (row) => {
              return row.protocols.map((p, i) => {
                return <el-tag size='mini' class='protocol'>{p.name}/{p.port}</el-tag>
              })
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AppletHostUpdate'
            }
          }
        }
      },
      headerActions: {
        createRoute: 'AppletHostCreate'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.applet-host >>> .protocol {
  margin-left: 3px;
}

</style>
