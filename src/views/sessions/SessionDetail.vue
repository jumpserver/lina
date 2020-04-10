<template>
  <GenericDetailPage :submenu="submenu" :active-menu="activeSubMenu" :title="title">
    <div slot="detail">
      <el-row :gutter="20">
        <el-col :span="14">
          <DetailCard :title="cardTitle" :items="detailItems" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-user" />
              <span>{{ cardActions }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div slot="command">
      <el-row :gutter="20">
        <el-col :span="14">
          <ListTable :table-config="tableConfig" :header-actions="headerActions" />
        </el-col>
        <el-col :span="10">
          <el-card class="box-card primary">
            <div slot="header" class="clearfix">
              <i class="fa fa-user" />
              <span>{{ cardActions }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import DetailCard from '@/components/DetailCard/index'
import ListTable from '@/components/ListTable'
import { getSessionDetail, getSessionCommands } from '@/api/sessions'
import { OutputExpandFormatter } from '@/components/ListTable/formatters'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'SessionDetail',
  components: {
    GenericDetailPage,
    DetailCard,
    ListTable
  },
  data() {
    return {
      tableConfig: {
        hasSelection: false,
        url: `/api/v1/terminal/commands/?session_id=${this.$route.params.id}`,
        columns: [
          'expandCol', 'index', 'input', 'timestamp'
        ],
        columnsMeta: {
          expandCol: {
            type: 'expand',
            prop: 'output',
            formatter: OutputExpandFormatter
          },
          index: {
            type: 'index'
          },
          input: {
            label: this.$t('sessions.command')
          },
          timestamp: {
            label: this.$t('sessions.date'),
            formatter: function(row) {
              return toSafeLocalDateStr(row.timestamp * 1000)
            }
          }

        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasCreate: false,
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasLeftActions: false,
        hasSearch: false,
        hasRightActions: false
      },
      activeSubMenu: 'detail',
      sessionData: {},
      commandData: {},
      submenu: [
        {
          title: this.$t('route.SessionDetail'),
          name: 'detail'
        },
        {
          title: this.$t('sessions.command'),
          name: 'command'
        }
      ]

    }
  },
  computed: {
    title() {
      return this.$t('sessions.sessionDetail')
    },
    cardTitle() { return this.sessionData.id },
    cardActions() {
      return this.$t('sessions.quickModify')
    },
    detailItems() {
      return [
        {
          key: this.$t('sessions.user'),
          value: this.sessionData.user
        },
        {
          key: this.$t('sessions.asset'),
          value: this.sessionData.asset
        },
        {
          key: this.$t('sessions.systemUser'),
          value: this.sessionData.system_user
        },
        {
          key: this.$t('sessions.protocol'),
          value: this.sessionData.protocol
        },
        {
          key: this.$t('sessions.loginFrom'),
          value: this.sessionData.login_from
        },
        {
          key: this.$t('sessions.remoteAddr'),
          value: this.sessionData.remote_addr
        },
        {
          key: this.$t('sessions.dateStart'),
          value: this.sessionData.date_start
        },
        {
          key: this.$t('sessions.dateEnd'),
          value: this.sessionData.date_end
        }
      ]
    }
  },
  mounted() {
    getSessionDetail(this.$route.params.id).then(data => {
      this.sessionData = data
    })

    getSessionCommands(this.$route.params.id).then(data => {
      this.commandData = data
    })
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
