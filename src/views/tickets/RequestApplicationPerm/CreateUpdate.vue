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

export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const vm = this
    const now = new Date()
    const date_expired = getDaysFuture(7, now).toISOString()
    const date_start = now.toISOString()
    // eslint-disable-next-line no-unused-vars
    var org_id = ''
    // eslint-disable-next-line no-unused-vars
    var apply_category_type = []
    return {
      hasDetailInMsg: false,
      loading: true,
      initial: {
        ips_or_not: true,
        meta: {
          apply_date_expired: date_expired,
          apply_date_start: date_start,
          apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
        },
        org_id: '',
        type: 'apply_application'

      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'comment']],
        [this.$t('tickets.RequestPerm'), ['meta']]
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
                  this.fieldsMeta.meta.fieldsMeta.apply_applications.el.ajax.url = `/api/v1/applications/applications/suggestion/?oid=${vm.org_id}&category=${event[0]}&type=${event[1]}`
                  this.fieldsMeta.meta.fieldsMeta.apply_system_users.el.ajax.url = event[0] === 'remote_app' ? `/api/v1/assets/system-users/suggestion/?oid=${vm.org_id}&protocol=rdp` : `/api/v1/assets/system-users/suggestion/?oid=${vm.org_id}&protocol=${event[1]}`
                }
              }
            }
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.myorgs?.map((item) => {
              return { label: item.name, value: item.id }
            })
          },
          hidden: (form) => {
            this.org_id = form['org_id']
            apply_category_type = this.apply_category_type
            const fieldsMeta = this.fieldsMeta.meta.fieldsMeta
            if (apply_category_type) {
              fieldsMeta.apply_applications.el.ajax.url = `/api/v1/applications/applications/suggestions/?oid=${vm.org_id}&category=${apply_category_type[0]}&type=${apply_category_type[1]}`
              fieldsMeta.apply_system_users.el.ajax.url = apply_category_type[0] === 'remote_app' ? `/api/v1/assets/system-users/suggestions/?oid=${vm.org_id}&protocol=rdp` : `/api/v1/assets/system-users/suggestions/?oid=${vm.org_id}&protocol=${apply_category_type[1]}`
            }
          }
        }
      },
      url: '/api/v1/tickets/tickets/?type=apply_application&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      },
      cleanFormValue(value) {
        const applications = value.meta.apply_applications
        const systemUsers = value.meta.apply_system_users
        if (applications && Array.isArray(applications) && applications.length < 1) {
          delete value.meta.apply_applications
        }
        if (systemUsers && Array.isArray(systemUsers) && systemUsers.length < 1) {
          delete value.meta.apply_system_users
        }
        return value
      }
    }
  },
  mounted() {
    let userAllOrgIds = this.$store.state.users.profile['myorgs']
    const currentOrgId = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : null
    userAllOrgIds = userAllOrgIds ? userAllOrgIds.map(i => i.id) : []
    if (userAllOrgIds.length > 0) {
      if (userAllOrgIds.includes(currentOrgId)) {
        this.initial.org_id = currentOrgId
      } else {
        this.initial.org_id = userAllOrgIds[0]
      }
    }
    this.loading = false
  },
  methods: {
    performSubmit(validValues) {
      const validMeta = validValues.meta
      const applyCategoryType = validMeta.apply_category_type
      const filter = (len, field) => {
        return applyCategoryType && applyCategoryType.length > 0 ? applyCategoryType[len] : validMeta[field]
      }
      validMeta.apply_category = filter(0, 'apply_category')
      validMeta.apply_type = filter(1, 'apply_type')
      delete validMeta['apply_category_type']
      return this.$axios['post'](`/api/v1/tickets/tickets/open/?type=apply_application`, validValues)
    }
  }
}
</script>

<style lang="less" scoped>
.el-form ::v-deep .el-cascader {
  width: 100%;
}
</style>
