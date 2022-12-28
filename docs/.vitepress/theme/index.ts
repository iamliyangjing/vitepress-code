import DefaultTheme from 'vitepress/theme'
import GlobalComponent from '../../../components/GlobalComponent.vue'

export default ({
    ...DefaultTheme,
    enhanceApp({ app }){
        app.component('GlobalComponent',GlobalComponent)
    }
})
