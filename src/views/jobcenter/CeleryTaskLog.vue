<template>
  <IBox class="transition-box" style="width: calc(100% - 17px);">
    <Term />
  </IBox>
</template>

<script>
import Term from '@/components/Term'
import IBox from '@/components/IBox'

export default {
  name: 'CeleryTaskLog',
  components: {
    Term,
    IBox
  }
}
</script>

<style scoped>

</style>
