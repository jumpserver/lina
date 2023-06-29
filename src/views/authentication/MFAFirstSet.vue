<template>
  <el-container>
    <el-header style="background: #f3f3f4; height: 80px;">
      <a href="/">
        <el-image :src="this.interface.logo_logout" href="/" style="height: 50px; width: 50px; margin: 15px 0 15px 200px; float: left" />
      </a>
      <span style="line-height: 80px; font-size: 25px">{{ this.interface.login_title }}</span>
    </el-header>
    <el-main>
      <UserMFA :has-first="false" />
    </el-main>
    <Footer :no-style="true" />
  </el-container>
</template>

<script>
import UserMFA from '@/views/profile/ProfileUpdate/UserMFA'
import Footer from '@/layout/components/Footer'
import { mapGetters } from 'vuex'

export default {
  name: 'MFAFirstSet',
  components: {
    UserMFA,
    Footer
  },
  data() {
    return {
      a: 'test'
    }
  },
  computed: {
    ...mapGetters([
      'publicSettings'
    ]),
    interface() {
      console.log('this: ', this.publicSettings.INTERFACE)
      return this.publicSettings.INTERFACE
    }
  }
}
</script>

<style scoped>

</style>
