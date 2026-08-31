<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { UploadField } from '@/components'
import { JSONManyToManySelect } from '@/components/Form/FormFields'
import { GenericCreateUpdatePage } from '@/layout/components'

export default {
  name: 'IntegrationApplicationCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      logo_file: null,
      url: '/api/v1/accounts/integration-applications/',
      fields: [
        [this.$t('Basic'), ['name', 'logo', 'owner']],
        [this.$t('AccountPolicy'), ['accounts', 'ip_group']],
        [this.$t('Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        owner: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/users/users/?fields_size=mini',
              transformOption: (item) => ({
                label: `${item.name} (${item.username})`,
                value: item.id
              })
            }
          }
        },
        accounts: {
          component: JSONManyToManySelect,
          el: {
            value: [],
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
          component: UploadField,
          el: {
            width: '20%',
            height: '10%',
            accept: 'image/jpg, image/png, image/jpeg, image/svg+xml'
          },
          on: {
            fileChange: ([value], updateForm) => {
              this.logo_file = value
            }
          }
        }
      },
      hasSaveContinue: false,
      createSuccessNextRoute: {
        name: 'IntegrationApplicationDetail'
      },
      performSubmit(values) {
        const formData = new FormData()
        const owner = Array.isArray(values.owner) ? values.owner[0] : values.owner
        values.owner = owner?.id || owner?.pk || owner?.value || owner
        delete values['logo']

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
        if (vm.logo_file) {
          formData.append('logo', vm.logo_file)
        }
        return this.$axios[this.method](this.iUrl, formData)
      }
    }
  },
  methods: {}
}
</script>
