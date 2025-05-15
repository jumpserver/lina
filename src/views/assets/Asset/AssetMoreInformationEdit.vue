<template>
  <GenericCreateUpdatePage :perform-submit="performSubmit" v-bind="$data" />
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
            'vendor', 'model', 'sn', 'cpu_model', 'cpu_count',
            'cpu_cores', 'cpu_vcpus', 'memory', 'disk_total',
            'distribution', 'distribution_version', 'arch', 'gpu_model'
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
