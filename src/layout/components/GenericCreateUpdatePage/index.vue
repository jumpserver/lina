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
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'
import { mapGetters } from 'vuex'

export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page,
    IBox,
    GenericCreateUpdateForm
  },
  computed: {
    ...mapGetters(['inDrawer']),
    pageAttrs() {
      return {
        ...this.$attrs,
        hideHeading: this.drawer || this.inDrawer
      }
    }
  },
  data() {
    return {
      drawer: false
    }
  },
  mounted() {
    this.$store.dispatch('common/getDrawerActionMeta').then((res) => {
      if (res.action) {
        this.drawer = true
      }
    })
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
