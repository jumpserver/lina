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
        [this.$t('common.Basic'), [
          'hostname', 'ip', 'platform', 'number'
        ]],
        [this.$t('assets.Hardware'), [
          'vendor', 'model', 'sn', 'cpu_model', 'cpu_count', 'cpu_cores',
          'cpu_vcpus', 'memory', 'disk_total'
        ]],
        [this.$t('assets.Os'), ['os', 'os_version', 'os_arch']]
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
            type: `input`
          }
        },
        model: {
          el: {
            type: `input`
          }
        },
        cpu_model: {
          el: {
            type: `input`
          }
        },
        memory: {
          el: {
            type: `input`
          }
        },
        disk_info: {
          el: {
            type: `input`
          }
        },
        disk_total: {
          el: {
            type: `input`
          }
        },
        sn: {
          el: {
            type: `input`
          }
        },
        os: {
          el: {
            type: `input`
          }
        },
        os_version: {
          el: {
            type: `input`
          }
        },
        os_arch: {
          el: {
            type: `input`
          }
        }
      },
      url: '/api/v1/assets/assets/',
      updateSuccessNextRoute: { name: 'AssetList' },
      createSuccessNextRoute: { name: 'AssetList' },
      objectDetailRoute: { name: 'AssetDetail' }
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
