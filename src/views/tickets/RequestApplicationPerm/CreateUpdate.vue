<template>
  <GenericCreateUpdatePage
    v-if="!loading"
    v-bind="$data"
    :perform-submit="performSubmit"
    :create-success-next-route="createSuccessNextRoute"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/FormFields/Select2'
import { getDaysFuture } from '@/utils/common'
import { Required } from '@/components/DataForm/rules'
import { ApplicationCascader } from '@/views/applications/const'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const vm = this
    const now = new Date()
    const date_expired = getDaysFuture(7, now).toISOString()
    const date_start = now.toISOString()
    let apply_category_type = []

    return {
      hasDetailInMsg: false,
      loading: true,
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        org_id: '',
        type: 'apply_application'

      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'comment']],
        [this.$t('tickets.RequestPerm'), [
          'apply_category_type', 'apply_applications', 'apply_system_users',
          'apply_date_start', 'apply_date_expired'
        ]]
      ],
      fieldsMeta: {
        type: {
          hidden: () => true,
          el: {
            disabled: true
          }
        },
        meta: {
          fields: [
            'apply_category_type', 'apply_applications', 'apply_system_users',
            'apply_date_start', 'apply_date_expired'],
          fieldsMeta: {
            apply_date_start: {
              label: this.$t('common.DateStart'),
              type: 'date-picker',
              el: {
                type: 'datetime'
              }
            },
            apply_applications: {
              type: 'assetSelect',
              component: Select2,
              label: this.$t('applications.App'),
              el: {
                value: [],
                ajax: {
                  url: '',
                  transformOption: (item) => {
                    return { label: item.name, value: item.id }
                  }
                }
              }
            },
            apply_system_users: {
              type: 'systemUserSelect',
              component: Select2,
              label: this.$t('assets.SystemUser'),
              el: {
                value: [],
                ajax: {
                  url: '',
                  transformOption: (item) => {
                    if (this.$route.query.type === 'k8s') {
                      return { label: item.name, value: item.id }
                    }
                    const username = item.username || '*'
                    return { label: item.name + '(' + username + ')', value: item.id }
                  }
                }
              }
            },
            apply_date_expired: {
              label: this.$t('common.DateEnd'),
              type: 'date-picker',
              el: {
                type: 'datetime'
              }
            },
            apply_category_type: {
              type: 'cascader',
              label: this.$t('applications.appType'),
              rules: [Required],
              el: {
                multiple: false,
                options: ApplicationCascader
              },
              on: {
                change: ([event], updateForm) => {
                  this.apply_category_type = event
                  updateForm({
                    apply_applications: [],
                    apply_system_users: []
                  })
                  const fieldsMeta = this.fieldsMeta.meta.fieldsMeta
                  const appUrl = `/api/v1/applications/applications/suggestion/?oid=${vm.org_id}&category=${event[0]}&type=${event[1]}`
                  fieldsMeta.apply_applications.el.ajax.url = appUrl

                  let protocol = event[1]
                  if (event[0] === 'remote_app') {
                    protocol = 'rdp'
                  }
                  const sysUserUrl = `/api/v1/assets/system-users/suggestion/?oid=${vm.org_id}&protocol=${protocol}`
                  fieldsMeta.apply_system_users.el.ajax.url = sysUserUrl
                }
              }
            }
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.workbenchOrgs.filter(item => {
              return item.id !== '00000000-0000-0000-0000-000000000000'
            })?.map((item) => {
              return { label: item.name, value: item.id }
            })
          },
          hidden: (form) => {
            this.org_id = form['org_id']
            apply_category_type = this.apply_category_type
            const fieldsMeta = this.fieldsMeta
            if (apply_category_type) {
              fieldsMeta.apply_applications.el.ajax.url = `/api/v1/applications/applications/suggestions/?oid=${vm.org_id}&category=${apply_category_type[0]}&type=${apply_category_type[1]}`
              fieldsMeta.apply_system_users.el.ajax.url = apply_category_type[0] === 'remote_app' ? `/api/v1/assets/system-users/suggestions/?oid=${vm.org_id}&protocol=rdp` : `/api/v1/assets/system-users/suggestions/?oid=${vm.org_id}&protocol=${apply_category_type[1]}`
            }
          }
        }
      },
      url: '/api/v1/tickets/apply-app-tickets/?state=pending',
      createSuccessNextRoute: {
        name: 'MyTicketList'
      },
      cleanFormValue(value) {
        const applications = value.apply_applications
        const systemUsers = value.apply_system_users
        if (applications && Array.isArray(applications) && applications.length < 1) {
          delete value.apply_applications
        }
        if (systemUsers && Array.isArray(systemUsers) && systemUsers.length < 1) {
          delete value.apply_system_users
        }
        return value
      }
    }
  },
  computed: {
    ...mapState({
      workbenchOrgs: state => state.users.workbenchOrgs.filter(item => {
        return item.id !== '00000000-0000-0000-0000-000000000000'
      })
    }),
    ...mapGetters(['currentOrg'])
  },
  mounted() {
    const currentOrgId = this.currentOrg.id || ''
    const userAllOrgIds = this.workbenchOrgs.map(i => i.id) || []
    if (userAllOrgIds.includes(currentOrgId)) {
      this.initial.org_id = currentOrgId
    } else {
      this.initial.org_id = userAllOrgIds[0]
    }

    this.loading = false
  },
  methods: {
    performSubmit(validValues) {
      const applyCategoryType = validValues.apply_category_type
      const filter = (len, field) => {
        return applyCategoryType && applyCategoryType.length > 0 ? applyCategoryType[len] : validValues[field]
      }
      validValues.apply_category = filter(0, 'apply_category')
      validValues.apply_type = filter(1, 'apply_type')
      delete validValues['apply_category_type']
      return this.$axios['post'](`/api/v1/tickets/apply-app-tickets/open/`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>
.el-form ::v-deep .el-cascader {
  width: 100%;
}
</style>
