<template>
  <Page>
    <IBox>
      <AutoDataForm v-bind="$attrs" v-on="$listeners">
        <slot v-for="item in $attrs.fields" :slot="`id:${item}`" :name="`id:${item}`" />
        <slot v-for="item in $attrs.fields" :slot="`$id:${item}`" :name="`$id:${item}`" />
      </AutoDataForm>
    </IBox>
  </Page>
</template>
<script>
import { Page, IBox } from '@/layout/components'
import AutoDataForm from '@/components/AutoDataForm'
export default {
  name: 'GenericCreateUpdatePage',
  components: {
    Page, IBox, AutoDataForm
  },
  mounted() {
    console.log('generic', this.$attrs)
    console.log(this.$data)
    console.log(this.fields)
  }
}
</script>

<style scoped>

</style>
