<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { periodicMeta } from '@/components/const'
import { ResourceSelect, Select2, TreeResourceSelect } from '@/components/Form/FormFields'
import i18n from '@/i18n/i18n'
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  name: 'AccountPushCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      nodeIds: [],
      assetIds: [],
      initial: {
        is_periodic: false,
        interval: 24
      },
      url: '/api/v1/accounts/check-account-automations/',
      fields: [
        [this.$t('Basic'), ['name']],
        [this.$t('Asset'), ['assets', 'nodes']],
        [this.$t('Config'), ['engines', 'recipients']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'resourceSelect',
          component: ResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/assets/?push_account_enabled=true&fields_size=mini',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            }
          },
          on: {
            input: ([value]) => {
              this.assetIds = value
            }
          }
        },
        engines: {
          component: Select2,
          el: {
            url: '/api/v1/accounts/account-check-engines/',
            multiple: true,
            ajax: {
              transformOption: (item) => {
                let name = item.name
                let disabled = false
                if (item.slug === 'check_gathered_account') {
                  name = `${name} (使用创建账号发现任务替代)`
                  disabled = true
                }
                return { label: name, value: item.slug, disabled: disabled }
              }
            }
          }
        },
        recipients: {
          helpText: i18n.t('OnlyMailSend'),
          el: {
            value: [],
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
            }
          }
        },
        nodes: {
          type: 'treeResourceSelect',
          component: TreeResourceSelect,
          rules: [{ required: false }],
          el: {
            value: [],
            url: '/api/v1/assets/nodes/?fields_size=mini',
            treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
            resourceName: this.$t('Nodes')
          },
          on: {
            input: ([value]) => {
              this.nodeIds = value || []
            }
          }
        },
        ...periodicMeta
      },
      createSuccessNextRoute: { name: 'AccountCheckList' },
      updateSuccessNextRoute: { name: 'AccountCheckList' }
    }
  },
  computed: {
    isUpdate() {
      return this.$route.path.indexOf('/update') > -1
    }
  },
  watch: {},
  mounted() {
    if (!this.$store.getters.hasValidLicense) {
      delete this.fields[3]
    }
  },
  methods: {
    hasType(type) {
      return this.isAssetType.indexOf(type) > -1
    }
  }
}
</script>

<style scoped></style>
