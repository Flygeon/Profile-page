import App from './App.svelte'
import { mount } from 'svelte'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = mount(App, {
  target: document.getElementById('app'),
})

export default app
