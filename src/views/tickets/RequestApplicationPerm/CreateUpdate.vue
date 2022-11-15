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
import PermissionFormActionField from '@/views/perms/components/PermissionFormActionField'
import { mapState, mapGetters } from 'vuex'
import store from '@/store'

export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const vm = this
    const now = new Date()
    const time = store.getters.publicSettings['TICKET_AUTHORIZE_DEFAULT_TIME']
    const unit = store.getters.publicSettings['TICKET_AUTHORIZE_DEFAULT_TIME_UNIT']
    const dividend = unit === 'hour' ? 24 : 1
    const date_expired = getDaysFuture(time / dividend, new Date()).toISOString()
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
          'apply_actions', 'apply_date_start', 'apply_date_expired'
        ]]
      ],
      fieldsMeta: {
        title: {
          el: {
            type: 'input'
          }
        },
        type: {
          hidden: () => true,
          el: {
            disabled: true
          }
        },
        apply_actions: {
          label: this.$t('perms.Actions'),
          component: PermissionFormActionField,
          helpText: this.$t('common.actionsTips'),
          el: {
            actions: ['all', 'connect']
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
              this.$axios.get(
                `/api/v1/perms/application-permissions/applications/actions/?category=${event[0]}`,
              ).then(res => {
                this.fieldsMeta.apply_actions.el.actions = res
              })
              this.fieldsMeta.apply_applications.el.ajax.url = `/api/v1/applications/applications/suggestion/?oid=${vm.org_id}&category=${event[0]}&type=${event[1]}`
              this.fieldsMeta.apply_system_users.el.ajax.url = event[0] === 'remote_app' ? `/api/v1/assets/system-users/suggestion/?oid=${vm.org_id}&protocol=rdp` : `/api/v1/assets/system-users/suggestion/?oid=${vm.org_id}&protocol=${event[1]}`
            }
          }
        },
        apply_date_start: {
          label: this.$t('common.DateStart'),
          type: 'date-picker',
          el: {
            type: 'datetime'
          }
        },
        apply_date_expired: {
          label: this.$t('common.DateEnd'),
          type: 'date-picker',
          el: {
            type: 'datetime'
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.noRootWorkbenchOrgs?.map((item) => {
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
          },
          on: {
            change: ([event], updateForm) => {
              updateForm({
                apply_applications: [],
                apply_system_users: []
              })
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
      workbenchOrgs: state => state.users.noRootWorkbenchOrgs
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
