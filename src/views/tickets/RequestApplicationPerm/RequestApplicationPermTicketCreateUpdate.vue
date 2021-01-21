<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :perform-submit="performSubmit"
    :create-success-next-route="createSuccessNextRoute"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import Select2 from '@/components/Select2'
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
      initial: {
        ips_or_not: true,
        apply_date_expired: date_expired,
        apply_date_start: date_start,
        org_id: 'DEFAULT',
        type: 'apply_application',
        apply_actions: ['all', 'connect', 'updownload', 'upload_file', 'download_file']
      },
      fields: [
        [this.$t('common.Basic'), ['title', 'type', 'org_id', 'assignees', 'comment']],
        [this.$t('tickets.RequestPerm'), ['apply_category_type', 'apply_application_group', 'apply_system_user_group', 'apply_date_start', 'apply_date_expired']]

      ],
      fieldsMeta: {
        type: {
          hidden: () => true,
          el: {
            disabled: true
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
          }
        },
        apply_application_group: {
          label: this.$t('applications.appName'),
          helpText: this.$t('tickets.helpText.application')
        },
        apply_system_user_group: {
          label: this.$t('assets.SystemUser'),
          helpText: this.$t('tickets.helpText.fuzzySearch')
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
            options: this.$store.state.users.profile.user_all_orgs
          },
          on: {
            changeOptions: ([event], updateForm) => {
              this.fieldsMeta.assignees.el.ajax.url = `/api/v1/tickets/assignees/?org_id=${event[0].value}`
            }
          }
        },
        assignees: {
          el: {
            multiple: true,
            value: [],
            ajax: {
              url: `/api/v1/tickets/assignees/?org_id=DEFAULT`,
              transformOption: (item) => {
                return { label: item.name + '(' + item.username + ')', value: item.id }
              }
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
  methods: {
    performSubmit(validValues) {
      const meta = {}
      const applications = validValues.apply_application_group
      const systemUser = validValues.apply_system_user_group
      if (applications) {
        meta.apply_application_group = applications.split(',')
      }
      delete validValues['apply_application_group']

      if (systemUser) {
        meta.apply_system_user_group = systemUser.split(',')
      }

      delete validValues['apply_system_user_group']

      meta.apply_category = validValues.apply_category_type[0]
      meta.apply_type = validValues.apply_category_type[1]

      delete validValues['apply_category_type']

      meta.apply_date_start = validValues.apply_date_start
      delete validValues['apply_date_start']

      meta.apply_date_expired = validValues.apply_date_expired
      delete validValues['apply_date_expired']

      validValues['meta'] = meta

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
