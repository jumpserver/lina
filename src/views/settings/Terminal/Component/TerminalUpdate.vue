<template>
  <GenericCreateUpdatePage
    :create-success-next-route="successUrl"
    :fields="fields"
    :fields-meta="fieldsMeta"
    :update-success-next-route="successUrl"
    :url="url"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { getAllCommandStorage, getAllReplayStorage } from '@/api/sessions'

export default {
  name: 'TerminalUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      successUrl: { name: 'TerminalSetting', params: { activeMenu: 'TerminalList' } },
      url: '/api/v1/terminal/terminals/',
      fields: [
        [this.$t('Info'), ['name', 'remote_addr', 'command_storage', 'replay_storage']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        command_storage: {
          type: 'select',
          options: []
        },
        replay_storage: {
          type: 'select',
          options: []
        }
      }
    }
  },
  computed: {
    title() {
      return this.$t('TerminalUpdate')
    },
    cardTitle() {
      return this.terminalData.name
    }
  },
  mounted() {
    this.initialSelect()
  },
  methods: {
    async initialSelect() {
      try {
        const commandOptions = await getAllCommandStorage()
        const replayOptions = await getAllReplayStorage()

        if (commandOptions && commandOptions.results) {
          commandOptions.results.forEach(item => {
            this.fieldsMeta.command_storage.options.push({ label: item.name, value: item.name })
          })
        }
        if (replayOptions && replayOptions.results) {
          replayOptions.results.forEach(item => {
            if (item.type.value === 'sftp') return
            this.fieldsMeta.replay_storage.options.push({ label: item.name, value: item.name })
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}
</script>
