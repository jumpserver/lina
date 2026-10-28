<template>
  <IBox>
    <el-alert v-if="helpText" :closable="false" :title="helpText" type="info" />
    <GenericCreateUpdateForm v-bind="iConfig" @submitSuccess="submitSuccess" @reset="$emit('reset')" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'Base',
  components: {
    IBox,
    GenericCreateUpdateForm
  },
  props: {
    helpText: {
      type: String,
      default: ''
    },
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

<style lang="scss" scoped>
</style>
