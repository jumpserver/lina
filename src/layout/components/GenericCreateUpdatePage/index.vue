<template>
  <Page>
    <IBox>
      <AutoDataForm :form="form" :fields="fields" :url="url" v-bind="$attrs" v-on="$listeners" @submit="handleSubmit">
        <slot v-for="item in fields" :slot="`id:${item}`" :name="`id:${item}`" />
        <slot v-for="item in fields" :slot="`$id:${item}`" :name="`$id:${item}`" />
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
  props: {
    url: {
      type: String,
      required: true,
    },
    method: {
      type: String,
      default: 'post'
    },
    fields: {
      type: Array,
      default: () => {
        return []
      }
    },
    form: {
      type: Object,
      default: () => { return {} }
    }
  },
  methods: {
    handleSubmit(values) {
      console.log('submit', values)
    }
  },
  mounted() {
    console.log('generic', this.$attrs)
    console.log(this.fields)
  }
}
</script>

<style scoped>

</style>
