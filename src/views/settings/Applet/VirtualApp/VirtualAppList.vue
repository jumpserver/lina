<template>
  <div>
    <ListTable class="virtual-app" v-bind="$data" />
  </div>
</template>

<script>
import { ListTable } from '@/components'
import { ActionsFormatter, ProtocolsFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'VirtualApp',
  components: {
    ListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/terminal/virtual-apps/',
        columnsShow: {
          min: ['name'],
          default: [
            'name', 'image_name', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'VirtualAppDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          protocols: {
            label: this.$t('assets.Protocols'),
            formatter: ProtocolsFormatter
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              onUpdate: ({ row }) => {
                const route = {
                  name: 'VirtualAppUpdate',
                  params: { id: row.id },
                  query: {}
                }
                this.$router.push(route)
              },
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/terminal/virtual-apps/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        createRoute: 'VirtualAppCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.virtual-app > > > .protocol {
  margin-left: 3px;
}

</style>
