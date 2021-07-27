<template>

  <GenericCreateUpdatePage
    ref="createUpdatePage"
    :fields="fields"
    :initial="initial"
    :fields-meta="fieldsMeta"
    :url="url"
  />

</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getDayFuture } from '@/utils/common'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        date_start: new Date().toISOString(),
        date_expired: getDayFuture(36500, new Date()).toISOString(),
        type: this.$route.query.type,
        category: this.$route.query.category
      },
      fields: [
        [this.$t('common.Basic'), ['name']],
        [this.$t('perms.User'), ['users', 'user_groups']],
        [this.$t('assets.Applications'), ['category', 'type', 'applications', 'system_users']],
        [this.$t('common.Other'), ['is_active', 'date_start', 'date_expired', 'comment']]
      ],
      url: '/api/v1/perms/application-permissions/',
      fieldsMeta: {
        users: {
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
        user_groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          }
        },
        category: {
          type: 'select',
          // options: [
          //   {
          //     label: this.$t(`applications.applicationsCategory.${this.$route.query.category}`),
          //     value: this.$route.query.category
          //   }
          // ],
          disabled: true
        },
        type: {
          type: 'select',
          // options: [
          //   {
          //     label: this.$t(`applications.applicationsType.${this.$route.query.type}`),
          //     value: this.$route.query.type
          //   }
          // ],
          disabled: true
        },
        applications: {
          label: this.$t('assets.Applications'),
          el: {
            value: [],
            ajax: {
              url: `/api/v1/applications/applications/?category=${this.$route.query.category}&type=${this.$route.query.type}`,
              transformOption: (item) => {
                return { label: item.name + ' (' + item.type_display + ')', value: item.id }
              }
            }
          }
        },
        system_users: {
          el: {
            value: [],
            ajax: {
              // const form = await this.$refs.createUpdatePage.$refs.createUpdateForm.getFormValue()
              url: this.$route.query.category === 'remote_app' ? `/api/v1/assets/system-users/?protocol=rdp` : `/api/v1/assets/system-users/?protocol=${this.$route.query.type}`,
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
        date_start: {
          label: this.$t('common.dateStart')
        },
        date_expired: {
          label: this.$t('common.dateExpired')
        },
        actions: {
          label: this.$t('perms.Actions')
        },
        is_active: {
          type: 'checkbox'
        }
      }

    }
  },
  computed: {

  },
  async mounted() {
    const params = this.$route.params
    const query = this.$route.query
    // 更新获取链接
    if (params.id || query.clone_from) {
      const form = await this.$refs.createUpdatePage.$refs.createUpdateForm.getFormValue()
      this.fieldsMeta.applications.el.ajax.url = `/api/v1/applications/applications/?category=${form.category}&type=${form.type}`
      this.fieldsMeta.system_users.el.ajax.url = form.category === 'remote_app' ? `/api/v1/assets/system-users/?protocol=rdp` : `/api/v1/assets/system-users/?protocol=${form.type}`
    }
  }
}
</script>

<style scoped>

</style>
