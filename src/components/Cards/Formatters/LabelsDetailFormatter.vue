<template>
  <div>
    <ILabel
      v-for="item in value"
      :key="item.key"
      :label="item"
    />
  </div>
</template>

<script>
import ILabel from '@/components/Widgets/ILabel/index.vue'

export default {
  name: 'LabelsDetailFormatter',
  components: { ILabel },
  props: {
    label: {
      type: String,
      default: ''
    },
    value: {
      type: Array,
      default: () => []
    }
  }
}
</script>

<style scoped>

</style>
