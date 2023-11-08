<template>
  <BaseAssetCreateUpdate v-bind="Object.assign($data, $attrs)" v-on="$listeners" />
</template>

<script>
import BaseAssetCreateUpdate from './BaseAssetCreateDrawer.vue'

export default {
  name: 'WebCreateUpdate',
  components: { BaseAssetCreateUpdate },
  data() {
    return {
      url: '/api/v1/assets/customs/',
      addFields: [
        [this.$t('assets.CustomFields'), ['custom_info'], 1]
      ],
      addFieldsMeta: {
        custom_info: {
          fields: '__all__'
        }
      }
    }
  },
  mounted() {
  }
}
</script>

<style>
</style>
