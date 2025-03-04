<template>
  <Page :class="{drawer: drawer}" v-bind="$attrs">
    <IBox>
      <GenericCreateUpdateForm ref="createUpdateForm" v-bind="$attrs" v-on="$listeners" />
    </IBox>
  </Page>
</template>
<script>
import IBox from '@/components/IBox'
import Page from '@/layout/components/Page'
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'

export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page, IBox, GenericCreateUpdateForm
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
::v-deep .ibox {
  margin: 0 10px 30px 0;

  .el-card__body {
    padding-top: 3px;
    padding-bottom: 60px;
  }
}

.drawer ::v-deep .page-heading {
  display: none;
}
</style>
