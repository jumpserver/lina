<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { AssetSelect } from '@/components'
import { periodicMeta } from '@/components/const'
import i18n from '@/i18n/i18n'

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
        [this.$t('Check config'), ['engines', 'recipients']],
        [this.$t('Periodic'), ['is_periodic', 'interval', 'crontab']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          rules: [
            { required: false }
          ],
          el: {
            baseUrl: '/api/v1/assets/assets/?push_account_enabled=true'
          },
          on: {
            input: ([value]) => {
              this.assetIds = value
            }
          }
        },
        engines: {
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
                return { label: name, value: item.id, disabled: disabled }
              }
            }
          }
        },
        recipients: {
          label: i18n.t('Recipients'),
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
          el: {
            multiple: true,
            ajax: {
              transformOption: (item) => {
                return { label: item['full_value'], value: item.id }
              },
              url: '/api/v1/assets/nodes/'
            }
          },
          on: {
            input: ([value]) => {
              this.nodeIds = value?.map(i => i.pk)
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

<style scoped>

</style>
