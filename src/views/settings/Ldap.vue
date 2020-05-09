<template>
  <div v-if="!loading">
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :initial="initialData"
      :update-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="initialData"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :more-buttons="moreButtons"
    />
    <el-dialog :visible.sync="dialogVisible" center>
      <div slot="title">
        {{ $t('setting.testLdapLoginTitle') }}
        <br>
        <small>
          {{ $t('setting.testLdapLoginSubtitle') }}
        </small>
      </div>
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
      <div slot="footer">
        <el-button @click="dialogVisible = false">{{ $tco('cancel') }}</el-button>
        <el-button type="primary" @click="testUerLogin">{{ $tco('confirm') }}</el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogLdapUserImport" center>
      <div slot="title">
        {{ $t('setting.importLdapUserTitle') }}
        <el-alert type="success"> {{ $t('setting.importLdapUserTip') }}</el-alert>
      </div>
      <ListTable
        ref="listTable"
        :table-config="tableConfig"
        :header-actions="headerActions"
        @error="handlerError($event)"
      />
      <div slot="footer">
        <el-button @click="dialogLdapUserImport = false">{{ $tco('cancel') }}</el-button>
        <el-button type="primary" @click="importUserClick">{{ $tco('import') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { testLdapSetting, testLdapUserLogin,
  importLdapUser, refreshLdapUserCache } from '@/api/settings'
import { ListTable } from '@/components'

export default {
  name: 'Ldap',
  components: {
    GenericCreateUpdateForm,
    ListTable
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      dialogVisible: false,
      dialogLdapUserImport: false,
      initialData: {},
      selectFields: ['AUTH_LDAP_SERVER_URI', 'AUTH_LDAP_BIND_DN', 'AUTH_LDAP_BIND_PASSWORD', 'AUTH_LDAP_SEARCH_OU',
        'AUTH_LDAP_SEARCH_FILTER', 'AUTH_LDAP_USER_ATTR_MAP', 'AUTH_LDAP'],
      successUrl: { name: 'Settings', params: { activeMenu: 'Email' }},
      fieldsMeta: {
        AUTH_LDAP_SERVER_URI: {
          label: this.$t('setting.authLdapServerUri'),
          rules: [
            { required: true }
          ]
        },
        AUTH_LDAP_BIND_DN: {
          label: this.$t('setting.authLdapBindDn')
        },
        AUTH_LDAP_BIND_PASSWORD: {
          label: this.$t('setting.authLdapBindPassword')
        },
        AUTH_LDAP_SEARCH_OU: {
          label: this.$t('setting.authLdapSearchOu'),
          helpText: this.$t('setting.helpText.authLdapSearchOu')
        },
        AUTH_LDAP_SEARCH_FILTER: {
          label: this.$t('setting.authLdapSearchFilter'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.authLdapSearchFilter')
        },
        AUTH_LDAP_USER_ATTR_MAP: {
          label: this.$t('setting.authLdapUserAttrMap'),
          el: {
            type: 'textarea'
          },
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.authLdapUserAttrMap')
        },
        AUTH_LDAP: {
          label: this.$t('setting.authLdap'),
          type: 'checkbox'
        }
      },
      url: '/api/v1/settings/setting/',
      moreButtons: [
        {
          title: this.$t('setting.ldapConnectTest'),
          callback: function(value, form) {
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            testLdapSetting(value).then(resp => {
              this.$notify({
                message: resp,
                type: 'success',
                duration: 4500
              })
            }).catch(err => {
              this.$notify({
                message: err,
                type: 'error',
                duration: 4500
              })
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
        columns: ['username', 'name', 'email', 'existing']
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        hasRefresh: false,
        extraActions: [
          {
            name: 'refresh',
            title: this.$t('setting.refreshLdapUser'),
            type: 'primary',
            has: true,
            can: true,
            callback: function() {
              refreshLdapUserCache().then(res => {
                this.$notify({
                  message: res.msg,
                  type: 'success',
                  duration: 4500
                })
                setTimeout(this.$refs.listTable.reloadTable, 500)
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
    testUerLogin() {
      testLdapUserLogin(this.userLoginForm).then(res => {
        this.$notify({
          message: res,
          type: 'success',
          duration: 4500
        })
      }).catch(err => {
        this.$notify({
          message: err,
          type: 'error',
          duration: 4500
        })
      })
    },
    importUserClick() {
      const selectIds = []
      this.$refs.listTable.selectedRows.forEach((item, index) => { selectIds.push(item.id) })
      const data = {
        username_list: selectIds
      }
      importLdapUser(data).then(res => {
        this.$notify({
          message: res.msg,
          type: 'success',
          duration: 4500
        })
      })
    },
    handlerError(errMsg) {
      setTimeout(this.$refs.listTable.reloadTable, 500)
    }
  }
}
</script>

<style scoped>

</style>
