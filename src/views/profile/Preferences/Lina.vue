<template>
  <Base v-bind="$data" />
</template>

<script>
import Base from './Base.vue'

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
