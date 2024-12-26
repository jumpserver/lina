<template>
  <div>
    <el-row :gutter="24">
      <el-col :md="24" :sm="24" class="generic-list-table">
        <AccountListTable
          ref="ListTable"
          :asset="object"
          :columns-default="columnsDefault"
          :has-clone="false"
          :has-import="false"
          :has-left-actions="true"
          :header-extra-actions="headerExtraActions"
          :url="iUrl"
          v-bind="$attrs"
        />
        <AccountTemplateDialog
          v-if="templateDialogVisible"
          :asset="object"
          :show-create="false"
          :visible.sync="templateDialogVisible"
          @onConfirm="onConfirm"
        />
      </el-col>
      <el-col :md="20" :sm="24" class="quick-actions">
        <QuickActions :actions="quickActions" :title="title" type="primary" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { AccountListTable } from '@/components'
import QuickActions from '@/components/QuickActions'
import AccountTemplateDialog from '@/views/assets/Asset/AssetCreateUpdate/components/AccountTemplateDialog'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'Detail',
  components: {
    QuickActions,
    AccountListTable,
    AccountTemplateDialog
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    },
    url: {
      type: String,
      default: ''
    },
    extraQuickActions: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      title: this.$t('Test'),
      templateDialogVisible: false,
      columnsDefault: ['name', 'username', 'asset'],
      headerExtraActions: [
        {
          name: this.$t('AccountTemplate'),
          title: this.$t('AccountTemplate'),
          can: () => this.$hasPerm('accounts.view_accounttemplate') && !this.$store.getters.currentOrgIsRoot,
          callback: () => {
            this.templateDialogVisible = true
          }
        }
      ],
      quickActions: [
        {
          title: this.$t('BatchTest'),
          attrs: {
            type: 'primary',
            label: this.$tc('Test'),
            disabled: ['clickhouse', 'redis', 'website', 'chatgpt'].indexOf(this.object.type.value) !== -1 ||
              this.$store.getters.currentOrgIsRoot
          },
          callbacks: Object.freeze({
            click: () => {
              this.$axios.post(
                `/api/v1/accounts/accounts/tasks/`,
                { action: 'verify', assets: [this.object.id] }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }
          })
        },
        ...this.extraQuickActions
      ]
    }
  },
  computed: {
    iUrl() {
      return this.url || `/api/v1/accounts/accounts/?asset=${this.object.id}`
    }
  },
  methods: {
    onConfirm(data) {
      data = data?.map(i => {
        i.asset = this.object.id
        return i
      })
      this.$axios.post(`/api/v1/accounts/accounts/`, data).then(() => {
        this.templateDialogVisible = false
        this.$refs.ListTable.addAccountSuccess()
        this.$message.success(this.$tc('AddSuccessMsg'))
      })
    }
  }
}
</script>
