<template>
  <GenericCreateUpdatePage v-bind="$data" :perform-submit="performSubmit" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'AssetMoreInformationEdit',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const nodesInitial = []
    if (this.$route.query['node']) {
      nodesInitial.push(this.$route.query.node)
    }
    return {
      initial: {
        is_active: true,
        platform: 'Linux',
        protocols: ['ssh/22'],
        nodes: nodesInitial
      },
      fields: [
        [this.$t('common.Basic'), ['hostname', 'ip', 'platform']],
        [this.$t('assets.Hardware'), ['vendor', 'model', 'number', 'cpu_model', 'memory', 'disk_info', 'disk_total']],
        [this.$t('assets.Os'), ['sn', 'os', 'os_version', 'os_arch']]
      ],
      fieldsMeta: {
        platform: {
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/platforms/',
              transformOption: (item) => {
                return { label: `${item.name}`, value: item.name }
              }
            }
          }
        },
        vendor: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        model: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        number: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        cpu_model: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        memory: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        disk_info: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        disk_total: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        sn: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        os: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        os_version: {
          el: {
            type: `input`,
            disabled: true
          }
        },
        os_arch: {
          el: {
            type: `input`,
            disabled: true
          }
        }
      },
      url: '/api/v1/assets/assets/',
      updateSuccessNextRoute: { name: 'AssetList' },
      createSuccessNextRoute: { name: 'AssetList' }
    }
  },
  methods: {
    getUrl() {
      const params = this.$route.params
      let url = this.url
      if (params.id) {
        url = `${url}${params.id}/`
      }
      return url
    },
    performSubmit(validValues) {
      return this.$axios['patch'](this.getUrl(), validValues)
    }
  }
}
</script>

<style>

</style>
