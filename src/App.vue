<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  :root {
    --color-primary: #1ab394;
    --color-success: #1c84c6;
    --color-info: #23c6c8;
    --color-warning: #f8ac59;
    --color-danger: #ed5565;
    --menu-bg: #2f4050;
    --menu-text: #a7b1c2;
    --menu-active-text: white;
    --menu-active-left: #1ab394;
    --menu-hover: '#293846';
    --submenu-bg: '#1f2d3d';
    --submenu-hover: '#253340';
  }
</style>
