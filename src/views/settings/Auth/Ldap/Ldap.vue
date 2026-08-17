<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="$data" ref="settingsForm" />
    <ImportDialog
      v-if="dialogLdapUserImport"
      v-model:visible="dialogLdapUserImport"
      :category="category"
    />
    <TestLoginDialog v-model:visible="dialogTest" :category="category" />
    <SyncSettingDialog v-if="dialogSyncSetting" v-model:visible="dialogSyncSetting" />
  </IBox>
</template>
<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import AttributeMappingInput from '../components/AttributeMappingInput.vue'
import UserGroupMappingInput from '../components/UserGroupMappingInput.vue'
import UserRoleMappingInput from '../components/UserRoleMappingInput.vue'
import {
  getGroupMappingErrors,
  getRoleMappingErrors,
  hasMappingErrors,
  isFallbackMapping,
  isValidLDAPAttribute,
  normalizeAttributeMapping,
  normalizeGroupMappings,
  normalizeRoleMappings
} from '../components/mapping'
import ImportDialog from './ImportDialog.vue'
import TestLoginDialog from './TestLoginDialog.vue'
import SyncSettingDialog from './SyncSettingDialog.vue'
import { IBox, UploadKey } from '@/components'
import rules from '@/components/Form/DataForm/rules'
import { UpdateToken } from '@/components/Form/FormFields'

export default {
  name: 'Ldap',
  components: {
    AttributeMappingInput,
    GenericCreateUpdateForm,
    IBox,
    ImportDialog,
    TestLoginDialog,
    SyncSettingDialog,
    UserGroupMappingInput,
    UserRoleMappingInput
  },
  data() {
    const category = 'ldap'
    const encryptedFields = [
      'AUTH_LDAP_BIND_PASSWORD',
      'AUTH_LDAP_CACERT_CONTENT',
      'AUTH_LDAP_CERT_CONTENT',
      'AUTH_LDAP_KEY_CONTENT'
    ]
    const hasText = (value) => typeof value === 'string' && value.trim().length > 0
    const normalizeLDAPFormValue = (value = {}) => {
      const normalized = { ...value }
      Object.entries(normalized).forEach(([key, fieldValue]) => {
        if (typeof fieldValue === 'string' && !encryptedFields.includes(key)) {
          normalized[key] = fieldValue.trim()
        }
      })
      normalized.AUTH_LDAP_USER_ATTR_MAP = normalizeAttributeMapping(
        normalized.AUTH_LDAP_USER_ATTR_MAP
      )
      delete normalized.AUTH_LDAP_USER_ATTR_MAP.wechat
      normalized.AUTH_LDAP_USER_GROUP_MAP = normalizeGroupMappings(
        normalized.AUTH_LDAP_USER_GROUP_MAP
      )
      normalized.AUTH_LDAP_USER_ROLE_MAP = normalizeRoleMappings(normalized.AUTH_LDAP_USER_ROLE_MAP)
      return normalized
    }
    const getCurrentFormValue = () =>
      this.$refs.settingsForm?.$refs?.form?.dataForm?.getFormValue?.() || {}
    const hasGroupSource = (value = {}) =>
      hasText(value.AUTH_LDAP_GROUP_ATTRIBUTE) || hasText(value.AUTH_LDAP_GROUP_SEARCH_FILTER)
    const roleAttributeOptions = [
      'dn',
      'groups',
      'memberOf',
      'department',
      'title',
      'employeeType',
      'sAMAccountName',
      'userPrincipalName',
      'displayName',
      'mail'
    ]
    const appendRoleAttributeOptions = (values) => {
      const seen = new Set(roleAttributeOptions.map((item) => item.toLowerCase()))
      values.forEach((value) => {
        if (typeof value !== 'string') return
        const attribute = value.trim()
        const normalized = attribute.toLowerCase()
        if (!attribute || seen.has(normalized)) return
        roleAttributeOptions.push(attribute)
        seen.add(normalized)
      })
    }
    const isLdaps = (formValue = {}) => {
      const serverUri = formValue.AUTH_LDAP_SERVER_URI || ''
      return serverUri.trim().toLowerCase().startsWith('ldaps://')
    }
    const validateAttributeMapping = (rule, value, callback) => {
      const mapping = normalizeAttributeMapping(value)
      const requiredFields = ['username', 'name', 'email']
      const missing = requiredFields.filter(
        (field) => typeof mapping[field] !== 'string' || !mapping[field]
      )
      if (missing.length) {
        callback(new Error(this.$t('LDAPRequiredAttributeMapping')))
        return
      }
      if (Object.values(mapping).some((attribute) => !isValidLDAPAttribute(attribute))) {
        callback(new Error(this.$t('InvalidLDAPAttribute')))
        return
      }
      callback()
    }
    const validateGroupMappings = (rule, value, callback) => {
      if (hasMappingErrors(getGroupMappingErrors(value))) {
        callback(new Error(this.$t('InvalidLDAPGroupMapping')))
        return
      }
      const hasExactMapping = value.some((row) => !isFallbackMapping(row))
      if (hasExactMapping && !hasGroupSource(getCurrentFormValue())) {
        callback(new Error(this.$t('LDAPGroupSourceRequired')))
        return
      }
      callback()
    }
    const validateRoleMappings = (rule, value, callback) => {
      if (hasMappingErrors(getRoleMappingErrors(value))) {
        callback(new Error(this.$t('InvalidLDAPRoleMapping')))
        return
      }
      const usesGroups = value.some(
        (row) =>
          !isFallbackMapping(row) &&
          typeof row?.attribute === 'string' &&
          row.attribute.trim().toLowerCase() === 'groups'
      )
      if (usesGroups && !hasGroupSource(getCurrentFormValue())) {
        callback(new Error(this.$t('LDAPGroupSourceRequired')))
        return
      }
      callback()
    }
    return {
      category: category,
      url: `/api/v1/settings/setting/?category=${category}`,
      dialogTest: false,
      dialogLdapUserImport: false,
      dialogSyncSetting: false,
      encryptedFields,
      fields: [
        [
          this.$t('Basic'),
          [
            'AUTH_LDAP',
            'AUTH_LDAP_SERVER_URI',
            'AUTH_LDAP_BIND_DN',
            'AUTH_LDAP_BIND_PASSWORD',
            'AUTH_LDAP_START_TLS',
            'AUTH_LDAP_CACERT_CONTENT',
            'AUTH_LDAP_CERT_CONTENT',
            'AUTH_LDAP_KEY_CONTENT'
          ]
        ],
        [this.$t('Search'), ['AUTH_LDAP_SEARCH_OU', 'AUTH_LDAP_SEARCH_FILTER']],
        [this.$t('UserAttributeMapping'), ['AUTH_LDAP_USER_ATTR_MAP']],
        [
          this.$t('UserGroupSource'),
          [
            'AUTH_LDAP_GROUP_ATTRIBUTE',
            'AUTH_LDAP_GROUP_SEARCH_FILTER',
            'AUTH_LDAP_GROUP_SEARCH_OU',
            'AUTH_LDAP_GROUP_SEARCH_USER_ATTRIBUTE'
          ]
        ],
        [this.$t('UserGroupMapping'), ['AUTH_LDAP_USER_GROUP_MAP']],
        [this.$t('RoleMapping'), ['AUTH_LDAP_USER_ROLE_MAP']],
        [
          this.$t('Other'),
          [
            'AUTH_LDAP_STRICT_SYNC',
            'AUTH_LDAP_CONNECT_TIMEOUT',
            'AUTH_LDAP_SEARCH_PAGED_SIZE',
            'AUTH_LDAP_CACHE_TIMEOUT',
            'AUTH_LDAP_ALWAYS_UPDATE_USER'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_BIND_DN: {
          rules: [rules.Required]
        },
        AUTH_LDAP_BIND_PASSWORD: {
          component: UpdateToken
        },
        AUTH_LDAP_SEARCH_OU: {
          rules: [rules.Required]
        },
        AUTH_LDAP_USER_ATTR_MAP: {
          component: AttributeMappingInput,
          label: this.$t('UserAttributeMapping'),
          rules: [
            {
              required: true,
              trigger: 'change',
              validator: validateAttributeMapping
            }
          ],
          el: {
            fields: [
              {
                value: 'username',
                label: this.$t('Username'),
                required: true,
                placeholder: 'sAMAccountName'
              },
              {
                value: 'name',
                label: this.$t('Name'),
                required: true,
                placeholder: 'displayName'
              },
              {
                value: 'email',
                label: this.$t('Email'),
                required: true,
                placeholder: 'mail'
              },
              { value: 'phone', label: this.$t('Phone'), placeholder: 'mobile' },
              { value: 'comment', label: this.$t('Comment'), placeholder: 'description' },
              { value: 'is_active', label: this.$t('IsActive'), placeholder: 'userAccountControl' }
            ]
          }
        },
        AUTH_LDAP_USER_GROUP_MAP: {
          component: UserGroupMappingInput,
          helpText: this.$t('LDAPGroupMappingHelp'),
          label: this.$t('UserGroupMapping'),
          rules: [
            {
              trigger: 'change',
              validator: validateGroupMappings
            }
          ]
        },
        AUTH_LDAP_USER_ROLE_MAP: {
          component: UserRoleMappingInput,
          helpText: this.$t('LDAPRoleMappingHelp'),
          label: this.$t('RoleMapping'),
          rules: [
            {
              trigger: 'change',
              validator: validateRoleMappings
            }
          ],
          el: {
            attributeOptions: roleAttributeOptions
          }
        },
        AUTH_LDAP_GROUP_ATTRIBUTE: {
          label: this.$t('LDAPGroupAttribute'),
          el: {
            placeholder: 'memberOf'
          }
        },
        AUTH_LDAP_GROUP_SEARCH_FILTER: {
          label: this.$t('LDAPGroupSearchFilter'),
          el: {
            placeholder: '(&(objectClass=group)(member=%s))'
          }
        },
        AUTH_LDAP_GROUP_SEARCH_OU: {
          label: this.$t('LDAPGroupSearchOU'),
          hidden: (formValue = {}) => !hasText(formValue.AUTH_LDAP_GROUP_SEARCH_FILTER)
        },
        AUTH_LDAP_GROUP_SEARCH_USER_ATTRIBUTE: {
          label: this.$t('LDAPGroupSearchUserAttribute'),
          hidden: (formValue = {}) => !hasText(formValue.AUTH_LDAP_GROUP_SEARCH_FILTER),
          el: {
            placeholder: this.$t('LDAPGroupSearchUserAttributePlaceholder')
          }
        },
        AUTH_LDAP_CACERT_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapCACertHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        },
        AUTH_LDAP_CERT_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapCertHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        },
        AUTH_LDAP_KEY_CONTENT: {
          component: UploadKey,
          helpText: this.$t('AuthLdapKeyHelpText'),
          hidden: (formValue) => !isLdaps(formValue)
        }
      },
      hasDetailInMsg: false,
      moreButtons: [
        {
          title: this.$t('LdapConnectTest'),
          loading: false,
          callback: async function (value, form, btn) {
            try {
              const valid = await form.validate()
              if (!valid) return
            } catch {
              return
            }
            value = normalizeLDAPFormValue(value)
            if (value['AUTH_LDAP_BIND_PASSWORD'] === undefined) {
              value['AUTH_LDAP_BIND_PASSWORD'] = ''
            }
            ;[
              'AUTH_LDAP_CACERT_CONTENT',
              'AUTH_LDAP_CERT_CONTENT',
              'AUTH_LDAP_KEY_CONTENT'
            ].forEach((key) => {
              if (value[key] === undefined) {
                value[key] = ''
              }
            })
            btn.loading = true
            this.enableWS()
            this.ws.onopen = (e) => {
              this.ws.send(JSON.stringify({ msg_type: 'testing_config', ...value }))
            }
            this.ws.onmessage = (e) => {
              const data = JSON.parse(e.data)
              if (data.ok) {
                this.$message.success(data.msg)
              } else {
                this.$message.error(data.msg)
              }
              btn.loading = false
            }
          }.bind(this)
        },
        {
          title: this.$t('LdapLoginTest'),
          callback: function (value, form) {
            this.dialogTest = true
          }.bind(this)
        },
        {
          title: this.$t('LdapBulkImport'),
          callback: function (value, form) {
            this.dialogLdapUserImport = true
          }.bind(this)
        },
        {
          title: this.$t('SyncSetting'),
          callback: function (value, form) {
            this.dialogSyncSetting = true
          }.bind(this)
        }
      ],
      submitMethod: () => 'patch',
      afterGetFormValue(obj) {
        const mapping = normalizeAttributeMapping(obj.AUTH_LDAP_USER_ATTR_MAP)
        if (!hasText(obj.AUTH_LDAP_GROUP_ATTRIBUTE) && mapping.groups) {
          obj.AUTH_LDAP_GROUP_ATTRIBUTE = mapping.groups
        }
        delete mapping.groups
        obj.AUTH_LDAP_USER_ATTR_MAP = mapping
        obj = normalizeLDAPFormValue(obj)
        appendRoleAttributeOptions([
          ...Object.values(mapping),
          obj.AUTH_LDAP_GROUP_ATTRIBUTE,
          obj.AUTH_LDAP_GROUP_SEARCH_USER_ATTRIBUTE,
          ...obj.AUTH_LDAP_USER_ROLE_MAP.map((row) => row.attribute)
        ])
        return obj
      },
      cleanFormValue(data) {
        data = normalizeLDAPFormValue(data)
        if (data['AUTH_LDAP_BIND_PASSWORD'] === '') {
          delete data['AUTH_LDAP_BIND_PASSWORD']
        }
        ;['AUTH_LDAP_CACERT_CONTENT', 'AUTH_LDAP_CERT_CONTENT', 'AUTH_LDAP_KEY_CONTENT'].forEach(
          (key) => {
            if (data[key] === '') {
              delete data[key]
            }
          }
        )
        const mapping = normalizeAttributeMapping(data.AUTH_LDAP_USER_ATTR_MAP)
        delete mapping.groups
        data.AUTH_LDAP_USER_ATTR_MAP = mapping
        if (!data.AUTH_LDAP_GROUP_SEARCH_FILTER) {
          data.AUTH_LDAP_GROUP_SEARCH_OU = ''
          data.AUTH_LDAP_GROUP_SEARCH_USER_ATTRIBUTE = ''
        }
        return data
      }
    }
  },
  methods: {
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/ldap/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
    }
  }
}
</script>

<style scoped>
.listTable :deep(.table-action-right-side) {
  padding-top: 0 !important;
}
</style>
