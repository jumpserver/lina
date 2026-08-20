<template>
  <GenericCreateUpdatePage
    :continue-clean-fields="continueCleanFields"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :has-detail-in-msg="false"
    :initial="initial"
    :on-perform-error="onPerformError"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { getLabelCreateFormConfig } from './formConfig'

export default {
  name: 'LabelCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return getLabelCreateFormConfig(this)
  }
}
</script>

<style></style>
