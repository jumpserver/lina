<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import ResourceSelect from '@/components/Form/FormFields/ResourceSelect'
import TreeResourceSelect from '@/components/Form/FormFields/TreeResourceSelect'
import AccountFormatter from './components/AccountFormatter'
import ExpireNoticePolicy from './components/ExpireNoticePolicy.vue'
import ShortExpireNoticeMinutes from './components/ShortExpireNoticeMinutes.vue'
import { AllAccount } from '../const'
import ProtocolsSelect from '@/components/Form/FormFields/AllOrSpec.vue'
import { isShortNoticeAtFuture, normalizeExpireNoticePayload } from './expireNotice'

function normalizeResourceIds(values) {
  if (!Array.isArray(values)) {
    return []
  }
  return values
    .map((item) => {
      if (item && typeof item === 'object') {
        return item.id ?? item.pk ?? item.value
      }
      return item
    })
    .filter((item) => item !== undefined && item !== null && item !== '')
}

export default {
  name: 'AccountFormatter',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node_id']) {
      nodesInitial.push(this.$route.query.node_id)
    }
    const assetsInitial = []
    if (this.$route.query['asset_id']) {
      assetsInitial.push(this.$route.query.asset_id)
    }
    const shortNoticeMinutes =
      this.$store.getters.publicSettings.PERM_EXPIRED_SHORT_NOTICE_MINUTES ?? 15
    return {
      initial: {
        nodes: nodesInitial,
        assets: assetsInitial,
        accounts: [AllAccount],
        expire_notice_policy: '',
        short_expire_notice_enabled: false,
        short_expire_notice_minutes: shortNoticeMinutes
      },
      fields: [
        [this.$t('Basic'), ['name']],
        // [this.$t('Resource'), ['users', 'user_groups']],
        [this.$t('User'), ['users', 'user_groups']],
        [this.$t('Asset'), ['assets', 'nodes']],
        [this.$t('Account'), ['accounts']],
        [this.$t('Protocol'), ['protocols']],
        [this.$t('Action'), ['actions']],
        [
          this.$t('Other'),
          [
            'is_active',
            'date_start',
            'date_expired',
            'expire_notice_policy',
            'short_expire_notice_enabled',
            'short_expire_notice_minutes',
            'comment'
          ]
        ]
      ],
      url: '/api/v1/perms/asset-permissions/',
      createSuccessNextRoute: { name: 'AssetPermissionDetail' },
      fieldsMeta: {
        users: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [
            {
              required: false
            }
          ],
          el: {
            value: [],
            url: '/api/v1/users/users/?fields_size=mini',
            resourceName: this.$t('Users')
          }
        },
        user_groups: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [
            {
              required: false
            }
          ],
          el: {
            value: [],
            url: '/api/v1/users/groups/?fields_size=mini',
            resourceName: this.$t('UserGroups')
          }
        },
        assets: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [
            {
              required: false
            }
          ],
          el: {
            value: [],
            url: '/api/v1/assets/assets/?fields_size=mini',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            }
          }
        },
        nodes: {
          type: 'treeResourceSelect',
          component: TreeResourceSelect,
          rules: [
            {
              required: false
            }
          ],
          el: {
            value: [],
            url: '/api/v1/assets/nodes/?fields_size=mini',
            treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
            resourceName: this.$t('Nodes')
          }
        },
        protocols: {
          component: ProtocolsSelect,
          el: {
            resource: this.$t('Protocols'),
            select2: {
              url: '/api/v1/assets/protocols/',
              ajax: {
                transformOption: (item) => {
                  return { label: item.label, value: item.value }
                }
              }
            }
          }
        },
        accounts: {
          type: 'input',
          component: AccountFormatter,
          el: {
            enableExcludeAccounts: true,
            enableNoneAccount: true,
            assets: [],
            nodes: []
          },
          hidden: (formValue) => {
            this.fieldsMeta.accounts.el.assets = normalizeResourceIds(formValue.assets)
            this.fieldsMeta.accounts.el.nodes = formValue.nodes
          }
        },
        actions: {
          label: this.$t('Action'),
          helpText: this.$t('ActionsTips'),
          el: {
            expandAll: true
          }
        },
        date_start: {},
        date_expired: {},
        expire_notice_policy: {
          component: ExpireNoticePolicy,
          label: this.$t('SystemExpireNotice')
        },
        short_expire_notice_enabled: {
          type: 'switch',
          label: this.$t('ShortExpireNotice')
        },
        short_expire_notice_minutes: {
          component: ShortExpireNoticeMinutes,
          label: this.$t('ShortExpireNoticeMinutes'),
          el: {},
          hidden: (formValue, field) => {
            field.el.dateExpired = formValue.date_expired
            field.el.disabled = !formValue.short_expire_notice_enabled
            return false
          },
          rules: [
            {
              validator: (rule, value, callback, source) => {
                if (
                  source.short_expire_notice_enabled &&
                  (!Number.isInteger(value) ||
                    value <= 0 ||
                    !isShortNoticeAtFuture(source.date_expired, value))
                ) {
                  callback(new Error(this.$t('ShortExpireNoticeFutureError')))
                  return
                }
                callback()
              },
              trigger: ['blur', 'change']
            }
          ]
        },
        comment: {},
        is_active: {
          type: 'checkbox'
        }
      },
      cleanFormValue(value) {
        if (!Array.isArray(value.accounts)) {
          value.accounts = value.accounts ? value.accounts.split(',') : []
        }
        return normalizeExpireNoticePayload(value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-tree) {
  padding: 5px 0;
}
</style>
