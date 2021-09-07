<template>
  <ListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import ListTable from '@/components/ListTable'

export default {
  name: 'SessionJoinRecords',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/terminal/session-join-records/?session=${this.object.id}`,
        columns: [
          'joiner_display', 'verify_code', 'reason', 'is_success', 'is_finished',
          'date_joined', 'date_left', 'org_name'
        ],
        columnsShow: {
          min: ['joiner_display', 'is_success', 'reason'],
          default: [
            'joiner_display', 'verify_code', 'is_success', 'reason', 'is_finished', 'date_joined', 'date_left'
          ]
        },
        columnsMeta: {
        }
      },
      headerActions: {
        hasImport: false,
        hasLeftActions: false,
        searchConfig: {
          exclude: ['date_joined', 'date_left']
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
