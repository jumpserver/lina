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
        file: {
          fieldsMeta: {
            has_secret_key: {
              label: this.$t('Configured'),
              component: BoolTextReadonly
            }
          }
        },
        basic: {
          fieldsMeta: {
            lang: {
              on: {
                change: ([value], updateForm) => {
                  this.$axios.get(`/core/i18n/${value}/`).then(() => {
                    window.location.reload()
                  })
                }
              }
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
