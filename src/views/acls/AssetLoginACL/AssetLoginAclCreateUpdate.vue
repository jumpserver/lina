<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import rules from '@/components/Form/DataForm/rules'
import { ResourceSelect, TagInput, WeekCronSelect } from '@/components/Form/FormFields'
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import InputWithUnit from '@/components/Form/FormFields/InputWithUnit.vue'
import { assetJSONSelectMeta } from '@/views/assets/const'
import AccountFormatter from '@/views/perms/AssetPermission/components/AccountFormatter.vue'
import { userJSONSelectMeta } from '@/views/users/const'

export default {
  name: 'ACLCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        action: 'accept',
        review_duration: 0,
        ...Object.fromEntries(
          [
            'reason',
            'mfa',
            'review',
            'notice',
            'face_verify',
            'face_online',
            'push_account',
            'change_secret'
          ].map((field) => [`${field}_enabled`, false])
        ),
        accounts: ['@ALL'],
        rules: {
          ip_group: ['*']
        }
      },
      fields: [
        [this.$t('Basic'), ['name', 'priority']],
        [this.$t('AclMatchConditions'), ['users', 'assets', 'accounts', 'rules']],
        [this.$t('AclExecutionAction'), ['action']],
        [
          this.$t('AclBeforeConnection'),
          [
            'notice_enabled',
            'recipients',
            'reason_enabled',
            'mfa_enabled',
            'face_verify_enabled',
            'review_enabled',
            'reviewers',
            'review_duration',
            'push_account_enabled'
          ]
        ],
        [this.$t('AclDuringSession'), ['face_online_enabled']],
        [this.$t('AclAfterSession'), ['change_secret_enabled']],
        [this.$t('AclOtherSettings'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        action: {
          type: 'radio-group',
          helpTextAsTip: false
        },
        ...Object.fromEntries(
          [
            'reason',
            'mfa',
            'review',
            'notice',
            'face_verify',
            'face_online',
            'push_account',
            'change_secret'
          ].map((field) => [
            `${field}_enabled`,
            {
              type: 'checkbox',
              hidden: (form) => form.action !== 'accept',
              helpTextAsTip: false,
              helpTextAsPlaceholder: false
            }
          ])
        ),
        review_duration: {
          dependsOn: 'review_enabled',
          component: InputWithUnit,
          helpTextAsTip: true,
          helpTextAsPlaceholder: false,
          hidden: (formValue) => formValue.action !== 'accept' || !formValue.review_enabled,
          el: { unit: 'hour', type: 'number', min: 0, max: 2147483647, step: 1 },
          rules: [
            {
              validator: (rule, value, callback) => {
                const hours = Number(value)
                if (
                  value === '' ||
                  value == null ||
                  !Number.isInteger(hours) ||
                  hours < 0 ||
                  hours > 2147483647
                ) {
                  return callback(new Error(this.$t('ReviewExemptionDurationInvalid')))
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
        },
        priority: {
          helpTextAsTip: false,
          helpTextAsPlaceholder: false,
          rules: [rules.Required]
        },
        is_active: {
          type: 'checkbox'
        },
        assets: assetJSONSelectMeta(this),
        rules: {
          fields: ['ip_group', 'time_period'],
          fieldsMeta: {
            ip_group: {
              component: TagInput,
              el: {
                value: ['*'],
                placeholder: this.$t('IP')
              },
              helpTextAsTip: false
            },
            time_period: {
              component: WeekCronSelect
            }
          }
        },
        users: userJSONSelectMeta(this),
        accounts: {
          component: AccountFormatter,
          el: {
            showAddTemplate: false,
            enableVirtualAccount: true,
            virtualAccountValues: ['@USER'],
            enableNoneAccount: false,
            enableExcludeAccounts: false,
            value: ['@ALL'],
            assets: []
          },
          hidden: (formValue) => {
            const ids = formValue.assets?.ids
            this.fieldsMeta.accounts.el.assets = ids || []
          }
        },
        reviewers: {
          dependsOn: 'review_enabled',
          type: 'resourceSelect',
          component: ResourceSelect,
          required: true,
          rules: [{ ...rules.RequiredChange, type: 'array', min: 1 }],
          hidden: (form) => form.action !== 'accept' || !form.review_enabled,
          helpTextAsTip: true,
          helpTextAsPlaceholder: false,
          el: {
            value: [],
            placeholder: this.$t('SelectApprovers'),
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        },
        recipients: {
          dependsOn: 'notice_enabled',
          component: ResourceSelect,
          required: true,
          rules: [{ ...rules.RequiredChange, type: 'array', min: 1 }],
          helpTextAsTip: true,
          helpTextAsPlaceholder: false,
          hidden: (form) => form.action !== 'accept' || !form.notice_enabled,
          el: {
            value: [],
            placeholder: this.$t('SelectRecipients'),
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        }
      },
      url: '/api/v1/acls/login-asset-acls/',
      cleanFormValue(value) {
        value.review_duration = Number(value.review_duration || 0)
        if (!Array.isArray(value.rules.ip_group)) {
          value.rules.ip_group = value.rules.ip_group ? value.rules.ip_group.split(',') : []
        }
        return value
      }
    }
  },
  methods: {}
}
</script>

<style></style>
