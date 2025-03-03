import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';


let app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        light: true,
        options: {
            darkModeSelector: '.no-dark-here'
        }
    },

});
app.mount('#app')
