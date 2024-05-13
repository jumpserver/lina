<template>
  <Page v-bind="$attrs">
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
  }
}
</script>

<style lang="scss" scoped>
>>> .ibox {
  margin: 0 10px 30px 0;

  .el-card__body {
    padding-top: 30px;
    padding-bottom: 60px;
  }
}
</style>
