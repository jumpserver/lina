<template>
  <Page v-bind="pageAttrs" :class="{ drawer: drawer }">
    <IBox>
      <GenericCreateUpdateForm v-bind="$attrs" ref="createUpdateForm" />
    </IBox>
  </Page>
</template>
<script>
import IBox from '@/components/Common/IBox'
import Page from '@/layout/components/Page'
import pagePresentation from '../pagePresentation'
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'

export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page,
    IBox,
    GenericCreateUpdateForm
  },
  mixins: [pagePresentation],
  computed: {
    pageAttrs() {
      return {
        ...this.$attrs,
        hideHeading: this.drawer
      }
    }
  },
  methods: {
    hasUnsavedChanges() {
      return this.$refs.createUpdateForm?.hasUnsavedChanges() || false
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.ibox) {
  margin: 0 10px 30px 0;

  .el-card__body {
    padding-top: 3px;
    padding-bottom: 60px;
  }
}

.drawer :deep(.page-heading) {
  display: none;
}
</style>
