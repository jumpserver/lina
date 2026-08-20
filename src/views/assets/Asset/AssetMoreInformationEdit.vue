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
    return {
      initial: {},
      fields: [
        [this.$t('Basic'), ['name', 'address']],
        [this.$t('Hardware'), ['gathered_info']]
      ],
      fieldsMeta: {
        gathered_info: {
          fields: [
            'vendor',
            'model',
            'sn',
            'cpu_model',
            'cpu_count',
            'cpu_cores',
            'cpu_vcpus',
            'memory',
            'disk_total',
            'distribution',
            'distribution_version',
            'arch',
            'gpu_model'
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
      let url = this.url
      const id = this.$context.get('id')
      if (id) {
        url = `${url}${id}/`
      }
      return url
    },
    performSubmit(validValues) {
      return this.$axios['patch'](this.getUrl(), validValues)
    }
  }
}
</script>

<style></style>
