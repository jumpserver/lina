<template>
  <Base v-bind="$data" />
</template>

<script>

import Base from './Base.vue'
import BoolTextReadonly from '@/components/Form/FormFields/BoolTextReadonly'

export default {
  name: 'Lina',
  components: {
    Base
  },
  data() {
    return {
      category: 'lina',
      fieldsMeta: {
        basic: {
          fieldsMeta: {
            has_secret_key: {
              label: this.$t('Configured'),
              component: BoolTextReadonly
            }
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
