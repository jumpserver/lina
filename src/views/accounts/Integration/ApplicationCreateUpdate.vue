<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { AvatarUploadField, JSONManyToManySelect } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  name: 'IntegrationApplicationCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      url: '/api/v1/accounts/integration-applications/',
      initial: {
        logo: '',
        accounts: { type: 'ids', ids: [] },
        credential_notifications_enabled: false
      },
      fields: [
        [this.$t('Basic'), ['name', 'logo']],
        [this.$t('AuthorizationPolicy'), ['accounts', 'ip_group']],
        [this.$t('ChangeNotifications'), ['credential_notifications_enabled']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        credential_notifications_enabled: {
          label: this.$t('AccountCredentialNotifications'),
          type: 'switch',
          helpText: this.$t('AccountCredentialNotificationsHelp')
        },
        ip_group: {
          helpText: this.$t('IpGroupHelpText')
        },
        accounts: {
          component: JSONManyToManySelect,
          el: {
            value: { type: 'ids', ids: [] },
            allowedTypes: ['all', 'ids', 'attrs'],
            resource: vm.$t('Accounts'),
            select2: {
              url: '/api/v1/accounts/accounts/',
              ajax: {
                transformOption: (item) => {
                  const assetInfo = `${item.asset.name}(${item.asset.address})`
                  const accountInfo = `${item.name}(${item.username})`
                  return { label: `${assetInfo} - ${accountInfo}`, value: item.id }
                }
              }
            },
            attrs: [
              { name: 'name', label: vm.$t('Name'), inTable: true },
              {
                name: 'asset',
                label: vm.$t('Asset'),
                type: 'm2m',
                inTable: true,
                el: {
                  url: '/api/v1/assets/assets/?fields_size=mini'
                },
                formatter: (row, column, value) => `${value.name}(${value.address})`
              }
            ]
          }
        },
        logo: {
          component: AvatarUploadField
        }
      },
      hasSaveContinue: false,
      objectDetailRoute: {
        name: 'IntegrationApplicationDetail'
      },
      getNextRoute: (res) => ({
        name: 'IntegrationApplicationDetail',
        params: { id: res.id }
      }),
      performSubmit({ logo, ...values }) {
        const formData = new FormData()

        if (!Array.isArray(values.ip_group)) {
          values.ip_group = values.ip_group ? values.ip_group.split(',') : []
        }

        const ipGroups = values.ip_group
        delete values['ip_group']
        for (const ip in ipGroups) {
          formData.append('ip_group', ipGroups[ip])
        }

        for (const key in values) {
          const value = key === 'accounts' ? JSON.stringify(values[key]) : values[key]
          formData.append(key, value)
        }
        if (logo instanceof File) {
          formData.append('logo', logo)
        }
        return this.$axios[this.method](this.iUrl, formData)
      }
    }
  },
  methods: {}
}
</script>
