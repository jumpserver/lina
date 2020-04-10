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
              <i class="fa fa-info" />
              <span>{{ cardActions }}</span>
            </div>
            <el-table class="el-table" :data="cardActionData" :show-header="false">
              <el-table-column prop="name" />
              <el-table-column prop="button" align="right">
                <template slot-scope="scope">
                  <el-button type="primary" size="mini" @click="handleButtonAction(scope.$index, scope.row)">
                    {{ scope.row.button }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <div slot="command">
      <el-row :gutter="20">
        <el-col :span="14">
          <ListTable :table-config="tableConfig" :header-actions="headerActions" />
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
    cardTitle() {
      return this.sessionData.id
    },
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
    },
    cardActionData() {
      return [
        {
          name: this.$t('sessions.replaySession'),
          button: this.$t('sessions.go'),
          value: 'replay'
        },
        {
          name: this.$t('sessions.downloadReplay'),
          button: this.$t('sessions.download'),
          value: 'download'
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
    handleButtonAction: function(index, row) {
      switch (row.value) {
        case 'replay':
          this.openReplaySession(this.sessionData.id)
          break
        case 'download':
          this.openReplayDownload(this.sessionData.id)
          break
        default:
          console.log('No Match button action: ' + row.value)
      }
    },

    openReplaySession: function(id) {
      const replayUrl = '/luna/replay/' + id
      window.open(replayUrl)
    },
    openReplayDownload: function(id) {
      const downloadUrl = '/terminal/session/00000000-0000-0000-0000-000000000000/replay/download/'
        .replace('00000000-0000-0000-0000-000000000000', id)
      window.open(downloadUrl)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-table /deep/ .el-table__row > td {
    line-height: 1.5;
    padding: 8px 0;
  }
  .el-table /deep/ .el-table__row > td> div > span {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
  .el-table /deep/ .el-table__header > thead > tr >th {
    padding: 8px 0;
    background-color: #F5F5F6;
    font-size: 13px;
    line-height: 1.5;
  }
  .table{
    margin-top: 15px;
  }
</style>
