<template>
  <div>
    <el-dropdown :show-timeout="50" @command="handleCommand">
      <span class="el-dropdown-link" style="vertical-align: baseline;">
        <svg-icon icon-class="question-mark" />
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="docs">{{ $t('Docs') }}</el-dropdown-item>
        <el-dropdown-item command="support">{{ $t('Support') }}</el-dropdown-item>
        <el-dropdown-item v-if="!hasLicence" command="enterprise">{{ $t('EnterpriseEdition') }}</el-dropdown-item>
        <el-dropdown-item command="about">{{ $tc('About') }}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <About :visible.sync="visible" />
  </div>
</template>

<script>
import About from './About.vue'

export default {
  name: 'Help',
  components: {
    About
  },
  data() {
    return {
      visible: false,
      URLSite: {
        HELP_DOCUMENT_URL: '',
        HELP_SUPPORT_URL: ''
      }
    }
  },
  computed: {
    hasLicence() {
      return this.$store.getters.hasValidLicense
    }
  },
  created() {
    this.initHelpURL()
  },
  methods: {
    initHelpURL() {
      this.URLSite.HELP_DOCUMENT_URL = this.$store.getters.publicSettings.HELP_DOCUMENT_URL
      this.URLSite.HELP_SUPPORT_URL = this.$store.getters.publicSettings.HELP_SUPPORT_URL
    },
    handleCommand(command) {
      switch (command) {
        case 'support':
          window.open(this.URLSite.HELP_SUPPORT_URL, '_blank')
          break
        case 'enterprise':
          window.open('https://www.jumpserver.com/#section-edition', '_blank')
          break
        case 'about':
          this.visible = true
          break
        default:
          window.open(this.URLSite.HELP_DOCUMENT_URL, '_blank')
          break
      }
    }
  }
}
</script>

<style scoped>
.icon {
  color: #fff;
}
</style>
