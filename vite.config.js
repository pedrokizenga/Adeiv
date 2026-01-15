import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                agendamento: resolve(__dirname, 'agendamento.html'),
                obrigado: resolve(__dirname, 'obrigado.html'),
            },
        },
    },
})
