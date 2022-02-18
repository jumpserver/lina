<template>
  <el-dropdown :show-timeout="50" @command="handleCommand">
    <span class="el-dropdown-link">
      {{ $t('common.nav.Help') }}<i class="el-icon-arrow-down el-icon--right" />
    </span>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item command="docs">{{ $t('common.nav.Docs') }}</el-dropdown-item>
      <el-dropdown-item command="support">{{ $t('common.nav.Support') }}</el-dropdown-item>
      <el-dropdown-item v-if="!hasLicence" command="enterprise">{{ $t('common.nav.EnterpriseEdition') }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'Help',
  data() {
    return {
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
          window.open('https://jumpserver.org/enterprise.html', '_blank')
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

</style>
