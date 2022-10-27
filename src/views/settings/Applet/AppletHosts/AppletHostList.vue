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
          'name', 'address', 'protocols',
          'comment', 'date_created', 'date_updated', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'address', 'protocols',
            'comment', 'actions'
          ]
        },
        columnsMeta: {
          protocols: {
            label: this.$t('assets.Protocols'),
            formatter: (row) => {
              return row.protocols.map(p => <el-tag size='mini' class='protocol'>{p.name}/{p.port} </el-tag>)
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
