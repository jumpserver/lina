// Load before the application and its dependencies: build.target transforms
// syntax, but does not provide missing runtime APIs in supported browsers.
import 'core-js/modules/es.array.at.js'
import 'core-js/modules/es.object.has-own.js'
import 'core-js/modules/es.array.find-last.js'
