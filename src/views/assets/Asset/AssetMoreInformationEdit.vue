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
        [this.$t('common.Basic'), ['name', 'address']],
        [this.$t('assets.Hardware'), ['info']]
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
        info: {
          fields: [
            'vendor', 'model', 'sn', 'cpu_model', 'cpu_count',
            'cpu_cores', 'cpu_vcpus', 'memory', 'disk_total',
            'distribution', 'distribution_version', 'arch'
          ]
        }
      },
      url: '/api/v1/assets/hosts/',
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
