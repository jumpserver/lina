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
            },
            secret_key: {
              el: {
                autocomplete: 'new-password',
                name: 'file-encryption-password'
              }
            },
            secret_key_again: {
              el: {
                autocomplete: 'new-password',
                name: 'file-encryption-password-confirmation'
              }
            }
          }
        },
        basic: {
          fieldsMeta: {
            lang: {
              el: {
                autocomplete: 'language',
                name: 'preference-language'
              },
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

<style lang="scss" scoped></style>
