<template>
  <div>
    <GenericListPage
      ref="GenericListTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <Dialog
      :show-buttons="false"
      :title="$tc('AddPassKey')"
      :visible.sync="dialogVisible"
      width="600px"
    >
      <el-alert v-if="!isLocalUser" :closable="false" class="source-alert" type="error">
        {{ $t('PasskeyAddDisableInfo', {source: source.label}) }}
      </el-alert>
      <AutoDataForm v-else v-bind="form" @submit="onAddConfirm" />
    </Dialog>
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { AutoDataForm, Dialog } from '@/components'
import passkey from '@/utils/passkey'
import { getErrorResponseMsg } from '@/utils/common'

export default {
  components: {
    GenericListPage,
    Dialog,
    AutoDataForm
  },
  data() {
    const ajaxUrl = '/api/v1/authentication/passkeys/'
    return {
      dialogVisible: false,
      form: {
        url: '',
        fields: [
          {
            id: 'name',
            label: this.$t('Name'),
            type: 'input',
            required: true,
            el: {
              placeholder: 'Laptop, Phone, etc.'
            }
          }
        ],
        hasSaveContinue: false,
        hasReset: false
      },
      tableConfig: {
        hasSelection: true,
        url: ajaxUrl,
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'is_active', 'date_last_used', 'date_created', 'actions']
        },
        columnsMeta: {
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasClone: false,
              onDelete: function({ row }) {
                this.$axios.delete(`${ajaxUrl}${row.id}/`).then(res => {
                  this.reloadTable()
                  this.$message.success(this.$tc('DeleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$tc('DeleteErrorMsg') + ' ' + error)
                })
              }.bind(this),
              extraActions: [
                {
                  name: 'Enabled',
                  title: ({ row }) => {
                    return row.is_active ? this.$t('Disable') : this.$t('Enable')
                  },
                  type: 'info',
                  can: () => this.$hasPerm('authentication.change_passkey'),
                  callback: function({ row }) {
                    this.$axios.patch(`${ajaxUrl}${row.id}/`,
                      { is_active: !row.is_active }
                    ).then(res => {
                      this.reloadTable()
                      this.$message.success(this.$tc('UpdateSuccessMsg'))
                    }).catch(error => {
                      this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
                    })
                  }.bind(this)
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasSearch: true,
        hasRightActions: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        hasCreate: this.$hasPerm('authentication.add_passkey'),
        canCreate: this.$hasPerm('authentication.add_passkey'),
        onCreate: function() {
          this.dialogVisible = true
        }.bind(this)
      }
    }
  },
  computed: {
    isLocalUser() {
      return this.source?.value === 'local'
    },
    source() {
      return this.$store.getters.currentUser?.source
    }
  },
  methods: {
    onAddConfirm(form) {
      const url = '/api/v1/authentication/passkeys/register/?name=' + form.name
      this.$axios.get(url).then(res => {
        return this.makeCredReq(res)
      }).then((options) => {
        if (!location.protocol.startsWith('https')) {
          throw new Error(this.$tc('HTTPSRequiredForSupport'))
        }
        return navigator.credentials.create(options)
      }).then((attestation) => {
        attestation['key_name'] = form.name
        const data = passkey.publicKeyCredentialToJSON(attestation)
        return this.$axios.post('/api/v1/authentication/passkeys/register/', data)
      }).then((res) => {
        this.dialogVisible = false
        this.reloadTable()
        this.$message.success(this.$tc('CreateSuccessMsg'))
      }).catch((error) => {
        if (error.response?.status === 412) {
          return
        }
        const msg = getErrorResponseMsg(error)
        alert(msg)
      })
    },
    makeCredReq(makeCredReq) {
      makeCredReq.publicKey.challenge = passkey.decode(makeCredReq.publicKey.challenge)
      makeCredReq.publicKey.user.id = passkey.decode(makeCredReq.publicKey.user.id)

      for (const excludeCred of makeCredReq.publicKey.excludeCredentials) {
        excludeCred.id = passkey.decode(excludeCred.id)
      }
      return makeCredReq
    },
    reloadTable() {
      this.$refs.GenericListTable.reloadTable()
    }
  }
}
</script>

<style lang='scss' scoped>
.source-alert ::v-deep .el-alert__content {
  text-align: center;
}
</style>
