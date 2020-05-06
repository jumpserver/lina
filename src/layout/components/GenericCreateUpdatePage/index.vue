<template>
  <Page>
    <IBox>
      <GenericCreateUpdateForm v-bind="$attrs" v-on="$listeners">
        <template #button-start>
          <slot name="button-start" />
        </template>
        <template #button-end>
          <slot name="button-end" />
        </template>
      </GenericCreateUpdateForm>
    </IBox>
  </Page>
</template>
<script>
import { IBox } from '@/components'
import { Page } from '@/layout/components'
import GenericCreateUpdateForm from '../GenericCreateUpdateForm'
export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page, IBox, GenericCreateUpdateForm
  }
}
</script>

<style scoped>
  .ibox >>> .el-card__body {
    padding-top: 30px;
  }

</style>
