<template>
  <div id="app">
    <router-view :key="$route.fullpath" />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>
