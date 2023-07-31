<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="iConfig" @submitSuccess="submitSuccess" />
  </IBox>
</template>

<script>
import IBox from '@/components/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'
export default {
  name: 'Base',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    enableField: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false
    }
  },
  computed: {
    iConfig() {
      return this.config
    }
  },
  methods: {
    submitSuccess(res) {
      this.$emit('input', !!res[this.enableField])
      this.visible = false
    }
  }
}
</script>

<style scoped>

</style>
