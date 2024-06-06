<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :fields-meta="fieldsMeta"
    :has-detail-in-msg="false"
    :initial="initial"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getRandomColor } from '@/utils/color'

export default {
  name: 'LabelCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        color: getRandomColor()
      },
      fields: [
        [this.$t('Basic'), ['name', 'value', 'color']],
        [this.$t('Other'), ['comment']]
      ],
      url: '/api/v1/labels/labels/',
      fieldsMeta: {
        color: {
          component: 'el-color-picker',
          el: {
            size: 'small',
            predefine: [
              '#ff4500', '#ff8c00', '#ffd700', '#90ee90', '#00ced1', '#1e90ff', '#c71585', '#ff69b4', '#ffffff',
              '#000000', '#f4a460', '#d2691e', '#8b4513', '#556b2f', '#2e8b57', '#4682b4', '#800080', '#ff00ff'
            ]
          }
        }
      }
    }
  }
}
</script>

<style>

</style>
