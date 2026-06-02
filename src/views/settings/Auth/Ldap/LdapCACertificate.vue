<template>
  <div>
    <input ref="file" accept=".pem" style="display: none" type="file" @change="uploadCertificate">
    <el-button :loading="loading" size="mini" @click="selectFile">
      {{ $t(exists ? 'Update' : 'Upload') }}
    </el-button>
    <el-button v-if="exists" :loading="loading" size="mini" type="danger" @click="deleteCertificate">
      {{ $t('Delete') }}
    </el-button>
  </div>
</template>

<script>
export default {
  name: 'LdapCACertificate',
  props: {
    category: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      exists: false,
      loading: false
    }
  },
  mounted() {
    this.getCertificate()
  },
  methods: {
    getUrl() {
      return `/api/v1/settings/ldap/ca/?category=${this.category}`
    },
    async getCertificate() {
      const data = await this.$axios.get(this.getUrl())
      this.exists = data.exists
    },
    selectFile() {
      this.$refs.file.click()
    },
    async uploadCertificate(event) {
      const file = event.target.files[0]
      if (!file) {
        return
      }
      const data = new FormData()
      data.append('file', file)
      this.loading = true
      try {
        await this.$axios.post(this.getUrl(), data, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        this.exists = true
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      } finally {
        this.loading = false
        this.$refs.file.value = ''
      }
    },
    async deleteCertificate() {
      const message = `${this.$t('DeleteWarningMsg')} ${this.$t('CACertificate')} ?`
      try {
        await this.$confirm(message, this.$t('Info'), { type: 'warning' })
      } catch (error) {
        return
      }
      this.loading = true
      try {
        await this.$axios.delete(this.getUrl())
        this.exists = false
        this.$message.success(this.$tc('DeleteSuccessMsg'))
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
</style>
