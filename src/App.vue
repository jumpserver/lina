<template>
  <div id="app">
    <router-view v-if="isRouterAlive" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { Watermark } from 'watermark-js-plus'

export default {
  name: 'App',
  data() {
    return {
      watermark: null
    }
  },
  computed: {
    ...mapState({
      isRouterAlive: state => state.common.isRouterAlive
    }),
    ...mapGetters({
      currentUser: 'currentUser',
      publicSettings: 'publicSettings'
    })
  },
  watch: {
    currentUser: {
      handler(newVal) {
        this.createWatermark()
      }
    },
    'publicSettings.SECURITY_WATERMARK_ENABLED': {
      handler(newVal) {
        if (!newVal) {
          return setTimeout(() => {
            this.watermark?.destroy()
            this.watermark = null
          })
        }

        this.createWatermark()
      }
    }
  },
  methods: {
    createWatermark() {
      console.log('currentUser', this.currentUser)
      if (this.currentUser?.username && this.publicSettings?.SECURITY_WATERMARK_ENABLED) {
        this.watermark = new Watermark({
          content: `${this.currentUser.username}(${this.currentUser.name})`,
          width: 200,
          height: 200,
          rotate: 45,
          fontWeight: 'normal',
          fontColor: 'rgba(128, 128, 128, 0.3)'
        })

        this.watermark.create()
      }
    }
  }
}
</script>
