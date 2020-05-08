<template>
  <Page>
    <IBox>
      <GenericCreateUpdateForm v-bind="$attrs" v-on="$listeners" />
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
</style>
