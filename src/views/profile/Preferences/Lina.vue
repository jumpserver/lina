<template>
  <IBox>
    <Base
      :categories="['lina', 'luna']"
      :fields-include="['basic.lang', 'graphics.file_name_conflict_resolution']"
      :fields-meta="fieldsMeta"
    />
  </IBox>
</template>

<script>
import Base from './Base.vue'
import IBox from '@/components/Common/IBox'

export default {
  name: 'Lina',
  components: {
    Base,
    IBox
  },
  data() {
    return {
      fieldsMeta: {
        basic: {
          fieldsMeta: {
            lang: {
              el: {
                autocomplete: 'language',
                name: 'preference-language'
              }
            }
          }
        }
      }
    }
  }
}
</script>
