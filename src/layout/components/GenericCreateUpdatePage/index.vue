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
import { getRuntimeActionMeta, isOverlayRuntime } from '@/libs/context/runtime'
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'

export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page,
    IBox,
    GenericCreateUpdateForm
  },
  computed: {
    pageAttrs() {
      return {
        ...this.$attrs,
        hideHeading: this.drawer
      }
    }
  },
  data() {
    return {
      drawer: false
    }
  },
  async mounted() {
    if (isOverlayRuntime(this)) {
      this.drawer = true
      return
    }
    const actionMeta = await getRuntimeActionMeta(this)
    if (actionMeta?.action) {
      this.drawer = true
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
