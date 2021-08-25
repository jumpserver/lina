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
export default {
  components: {
    GenericCreateUpdatePage
  },

  data() {
    const now = new Date()
    const date_expired = getDaysFuture(7, now).toISOString()
    const date_start = now.toISOString()
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
              label: this.$t('perms.Asset'),
              el: {
                value: [],
                ajax: {
                  url: '',
                  transformOption: (item) => {
                    return { label: item.name + ' (' + item.type_display + ')', value: item.id }
                  }
                }
              }
            },
            apply_system_users: {
              type: 'systemUserSelect',
              component: Select2,
              label: '系统用户',
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
                options: [
                  {
                    label: this.$t(`applications.applicationsCategory.db`),
                    value: 'db',
                    children: [
                      {
                        label: 'MySQL',
                        value: 'mysql'
                      },
                      {
                        label: 'Oracle',
                        value: 'oracle'
                      },
                      {
                        label: 'PostgreSQL',
                        value: 'postgresql'
                      },
                      {
                        label: 'MariaDB',
                        value: 'mariadb'
                      }
                    ]
                  },
                  {
                    label: this.$t(`applications.applicationsCategory.cloud`),
                    value: 'cloud',
                    children: [
                      {
                        label: 'Kubernetes',
                        value: 'k8s'
                      }
                    ]
                  },
                  {
                    label: this.$t(`applications.applicationsCategory.remote_app`),
                    value: 'remote_app',
                    children: [
                      {
                        label: 'MySQL Workbench',
                        value: 'mysql_workbench'
                      },
                      {
                        label: 'vSphere Client',
                        value: 'vmware_client'
                      },
                      {
                        label: 'Custom',
                        value: 'custom'
                      }, {
                        label: 'Chrome',
                        value: 'chrome'
                      }
                    ]
                  }
                ]
              },
              on: {
                change: ([event], updateForm) => {
                  this.fieldsMeta.meta.fieldsMeta.apply_applications.el.ajax.url = `/api/v1/applications/applications/?category=${event[0]}&type=${event[1]}`
                  this.fieldsMeta.meta.fieldsMeta.apply_system_users.el.ajax.url = event[0] === 'remote_app' ? `/api/v1/assets/system-users/?protocol=rdp` : `/api/v1/assets/system-users/?protocol=${event[1]}`
                }
              }
            }
          }
        },
        org_id: {
          component: Select2,
          el: {
            multiple: false,
            options: this.$store.state.users.profile.user_all_orgs.map((item) => {
              return { label: item.name, value: item.id }
            })
          },
          on: {
            changeOptions: ([event], updateForm) => {
              this.fieldsMeta.assignees.el.ajax.url = `/api/v1/tickets/assignees/?org_id=${event[0].value}`
            }
          }
        }
      },
      url: '/api/v1/tickets/tickets/?type=apply_application&action=open',
      createSuccessNextRoute: {
        name: 'TicketList'
      }
    }
  },
  mounted() {
    if (this.$store.state.users.profile.user_all_orgs.length > 0) {
      this.initial.org_id = this.$store.state.users.profile.user_all_orgs[0].id
    }
    this.loading = false
  },
  methods: {
    performSubmit(validValues) {
      validValues.meta.apply_category = validValues.meta.apply_category_type[0]
      validValues.meta.apply_type = validValues.meta.apply_category_type[1]
      delete validValues.meta['apply_category_type']
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
