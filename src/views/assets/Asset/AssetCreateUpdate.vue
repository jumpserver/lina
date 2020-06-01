<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import CustomInput from '@/components/CustomInput'
export default {
  name: 'AssetCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        is_active: true,
        platform: 'Linux'
      },
      fields: [
        [this.$t('assets.Basic'), ['hostname', 'ip', 'platform', 'public_ip', 'domain']],
        [this.$t('assets.Protocols'), ['protocols']],
        [this.$t('assets.Auth'), ['admin_user']],
        [this.$t('assets.Node'), ['nodes']],
        [this.$t('assets.Label'), ['labels']],
        [this.$t('assets.Other'), ['is_active', 'comment']]
      ],
      fieldsMeta: {
        protocols: {
          component: CustomInput
        },
        platform: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/platforms/',
              processResults: (data) => {
                let results = data.results
                results = results.map((item) => {
                  return { label: item.name, value: item.name }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        domain: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/domains/',
              processResults: (data) => {
                let results = data.results
                results = results.map((item) => {
                  return { label: `${item.name}`, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        admin_user: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/admin-users/',
              processResults: (data) => {
                let results = data.results
                results = results.map((item) => {
                  return { label: `${item.name}`, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        nodes: {
          el: {
            ajax: {
              url: '/api/v1/assets/nodes/',
              processResults: (data) => {
                let results = data.results
                results = results.map((item) => {
                  return { label: `${item.full_value}`, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        labels: {
          el: {
            ajax: {
              url: '/api/v1/assets/labels/',
              processResults: (data) => {
                let results = data.results
                results = results.map((item) => {
                  return { label: `${item.name}`, value: item.id }
                })
                const more = !!data.next
                return { results: results, pagination: more, total: data.count }
              }
            }
          }
        },
        is_active: {
          type: 'switch'
        }
      },
      url: '/api/v1/assets/assets/'
    }
  }
}
</script>

<style>

</style>
