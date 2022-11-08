import Vue from 'vue'
import moment from 'moment'

Vue.filter('date', function(value) {
  return moment(value, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
})

