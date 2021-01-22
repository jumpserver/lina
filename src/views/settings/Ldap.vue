<template>
  <div>
    <IBox>
      <GenericCreateUpdateForm
        :fields="selectFields"
        :url="url"
        :fields-meta="fieldsMeta"
        :get-method="getMethod"
        :more-buttons="moreButtons"
        :has-detail-in-msg="false"
      />
    </IBox>
    <Dialog
      :title="$t('setting.importLdapUserTitle')"
      :visible.sync="dialogLdapUserImport"
      :destroy-on-close="true"
    >
      <el-alert type="success"> {{ $t('setting.importLdapUserTip') }}</el-alert>
      <ListTable
        ref="listTable"
        class="listTable"
        :table-config="tableConfig"
        :header-actions="headerActions"
        @error="handlerListTableXHRError($event)"
      />
      <div slot="footer">
        <el-button @click="dialogLdapUserImport=false">{{ $t('common.Cancel') }}</el-button>
        <el-button type="primary" :loading="dialogLdapUserImportLoginStatus" @click="importUserClick">{{ $t('common.Import') }}</el-button>
      </div>
    </Dialog>

    <Dialog
      :visible.sync="dialogVisible"
      :title="$t('setting.testLdapLoginTitle') "
      :destroy-on-close="true"
      :loading-status="testLdapLoginStatus"
      @confirm="testUerLoginClick()"
      @cancel="dialogVisible = false"
    >
      <el-form
        :model="userLoginForm"
        label-position="right"
        label-width="17%"
      >
        <el-form-item :label="$t('setting.username')">
          <el-input
            v-model="userLoginForm.username"
            :placeholder="$t('setting.usernamePlaceholder')"
            autocomplete="off"
          />

        </el-form-item>
        <el-form-item :label="$t('setting.password')">
          <el-input
            v-model="userLoginForm.password"
            type="password"
            :placeholder="$t('setting.passwordPlaceholder')"
            autocomplete="off"
          />
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>
<script>
import Dialog from '@/components/Dialog'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import {
  testLdapSetting, testLdapUserLogin,
  importLdapUser, refreshLdapUserCache, StartLdapUserCache
} from '@/api/settings'
import ListTable from '@/components/ListTable'
import { IBox } from '@/components'

export default {
  name: 'Ldap',
  components: {
    GenericCreateUpdateForm,
    ListTable,
    IBox,
    Dialog
  },
  data() {
    return {
      loading: true,
      testLdapLoginStatus: false,
      dialogVisible: false,
      dialogLdapUserImport: false,
      dialogLdapUserImportLoginStatus: false,
      selectFields: [
        [
          this.$t('setting.LDAPServerInfo'),
          [
            'AUTH_LDAP_SERVER_URI', 'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD'
          ]
        ],
        [
          this.$t('setting.LDAPUser'),
          [
            'AUTH_LDAP_SEARCH_OU', 'AUTH_LDAP_SEARCH_FILTER', 'AUTH_LDAP_USER_ATTR_MAP'
          ]
        ],
        [
          this.$t('common.Other'),
          [
            'AUTH_LDAP'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_USER_ATTR_MAP: {
          el: {
            type: 'textarea'
          }
        }
      },
      url: '/api/v1/settings/setting/?category=ldap',
      moreButtons: [
        {
          title: this.$t('setting.ldapConnectTest'),
          callback: function(value, form) {
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            testLdapSetting(value).then(resp => {
              this.$message.success(resp)
            }).catch(err => {
              const response = err.response
              this.$message.error(response.data)
            })
          }.bind(this)
        },
        {
          title: this.$t('setting.ldapLoginTest'),
          callback: function(value, form) {
            this.dialogVisible = true
          }.bind(this)
        },
        {
          title: this.$t('setting.ldapBulkImport'),
          callback: function(value, form) {
            this.dialogLdapUserImport = true
          }.bind(this)
        }
      ],
      userLoginForm: {
        username: '',
        password: ''
      },
      tableConfig: {
        url: '/api/v1/settings/ldap/users/',
        columns: ['username', 'name', 'email', 'existing'],
        columnsMeta: {
          username: {
            label: this.$t('users.Username'),
            width: '180px'
          },
          name: {
            label: this.$t('users.Name'),
            width: '180px'
          },
          email: {
            label: this.$t('users.Email')
          },
          existing: {
            label: this.$t('users.Existing'),
            width: '120px'
          }

        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        hasRefresh: true,
        extraActions: [
          {
            name: 'refresh',
            title: this.$t('setting.refreshLdapUser'),
            type: 'primary',
            has: true,
            can: true,
            callback: function() {
              refreshLdapUserCache().then(res => {
                this.$message.success(this.$t('setting.refreshLdapCache'))
                StartLdapUserCache()
              })
            }.bind(this)
          }
        ]
      }
    }
  },
  mounted() {
    Object.assign(this.initialData, this.object)
    if (this.object.AUTH_LDAP_USER_ATTR_MAP !== null) {
      this.initialData.AUTH_LDAP_USER_ATTR_MAP = JSON.stringify(this.object.AUTH_LDAP_USER_ATTR_MAP)
    }
    this.loading = false
  },
  methods: {
    cleanFormValue(data) {
      if (data['AUTH_LDAP_BIND_PASSWORD'] === '') {
        delete data['AUTH_LDAP_BIND_PASSWORD']
      }
      if (data['AUTH_LDAP_USER_ATTR_MAP']) {
        data['AUTH_LDAP_USER_ATTR_MAP'] = JSON.parse(data['AUTH_LDAP_USER_ATTR_MAP'])
      }
      return {
        ldap: data
      }
    },
    getMethod() {
      return 'put'
    },
    testUerLoginClick() {
      this.testLdapLoginStatus = true
      testLdapUserLogin(this.userLoginForm).then(res => {
        this.$message.success(res)
      }).catch(err => {
        const response = err.response
        this.$message.error(response.data)
        // eslint-disable-next-line no-return-assign
      }).finally(() => this.testLdapLoginStatus = false)
    },
    importUserClick() {
      this.dialogLdapUserImportLoginStatus = true
      const selectIds = []
      this.$refs.listTable.selectedRows.forEach((item, index) => { selectIds.push(item.id) })
      const data = {
        username_list: selectIds
      }
      if (selectIds.length === 0) {
        this.$message.error(this.$t('setting.unselectedUser'))
        this.dialogLdapUserImportLoginStatus = false
      } else {
        importLdapUser(data).then(res => {
          this.$message.success(res.msg)
          // eslint-disable-next-line no-return-assign
        }).finally(() => this.dialogLdapUserImportLoginStatus = false)
      }
    },
    handlerListTableXHRError(errMsg) {
      if (this.dialogLdapUserImport) {
        setTimeout(this.$refs.listTable.reloadTable, 30000)
      }
    }
  }
}
</script>

<style scoped>

.listTable ::v-deep .table-action-right-side{
  padding-top: 0px !important;
}

</style>
