<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { REMOTE_APP_TYPE_FIELDS_MAP, REMOTE_APP_TYPE_META_MAP, REMOTE_APP_PATH_DEFAULT_MAP } from './const'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const appType = this.$route.query.type || 'chrome'
    const fieldsMap = REMOTE_APP_TYPE_FIELDS_MAP[appType]
    const appTypeMeta = REMOTE_APP_TYPE_META_MAP[appType]
    const pathInitial = REMOTE_APP_PATH_DEFAULT_MAP[appType]

    return {
      initial: {
        type: appTypeMeta.name,
        path: pathInitial
      },
      fields: [
        [this.$t('common.Basic'), ['name', 'type', 'domain']],
        [appTypeMeta.title, ['attrs']],
        [this.$t('common.Other'), ['comment']]
      ],
      url: '/api/v1/applications/applications/',
      getUrl() {
        const params = this.$route.params
        let url = `/api/v1/applications/applications/`
        if (params.id) {
          url = `${url}${params.id}/`
        }
        return `${url}?type=${this.$route.query.type}`
      },
      performSubmit(validValues) {
        const params = this.$route.params
        const baseUrl = `/api/v1/applications/applications/`
        const url = (params.id) ? `${baseUrl}${params.id}/` : baseUrl
        const method = this.getMethod()
        switch (validValues.type) {
          case 'chrome': {
            validValues.attrs = {
              chrome_target: validValues.chrome_target,
              chrome_username: validValues.chrome_username,
              chrome_password: validValues.chrome_password,
              asset: validValues.asset,
              path: validValues.path
            }
            break
          }
          case 'mysql_workbench': {
            validValues.attrs = {
              mysql_workbench_ip: validValues.mysql_workbench_ip,
              mysql_workbench_port: validValues.mysql_workbench_port,
              mysql_workbench_name: validValues.mysql_workbench_name,
              mysql_workbench_username: validValues.mysql_workbench_username,
              mysql_workbench_password: validValues.mysql_workbench_password,
              asset: validValues.asset,
              path: validValues.path
            }
            break
          }
          case 'vmware_client': {
            validValues.attrs = {
              vmware_password: validValues.vmware_password,
              vmware_username: validValues.vmware_username,
              vmware_target: validValues.vmware_target,
              asset: validValues.asset,
              path: validValues.path
            }
            break
          }
          case 'custom': {
            validValues.attrs = {
              custom_cmdline: validValues.custom_cmdline,
              custom_target: validValues.custom_target,
              custom_username: validValues.custom_username,
              custom_password: validValues.custom_password,
              asset: validValues.asset,
              path: validValues.path
            }
            break
          }
        }
        validValues.category = 'remote_app'
        console.log(validValues)
        return this.$axios[method](`${url}?type=${validValues.type}`, validValues)
      },
      fieldsMeta: {
        asset: {
          rules: [{ required: true }],
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/assets/assets/?platform__base=Windows',
              transformOption: (item) => {
                return { label: item.hostname, value: item.id }
              }
            }
          }
        },
        type: {
          type: 'select',
          options: [
            {
              label: appTypeMeta.title,
              value: appTypeMeta.name
            }
          ],
          disabled: true
        },
        asset_info: {
          type: 'input',
          hidden: () => true
        },
        domain: {
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/domains/'
            }
          }
        },
        ...fieldsMap
      }
    }
  },
  computed: {
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    }
  }
}

</script>

<style lang="less" scoped>
</style>
