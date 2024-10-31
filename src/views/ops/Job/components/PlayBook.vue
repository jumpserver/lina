<template>
  <div>
    <BaseJob :type="'playbook'" />
  </div>
</template>

<script>
import BaseJob from './BaseJob'

export default {
  name: 'PlayBook',
  components: {
    BaseJob
  }
}
</script>
