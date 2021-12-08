import 'tailwindcss/tailwind.css'
import type { AppProps /*, AppContext */ } from 'next/app'
import React from 'react'
import { AlertLogs } from '../components/alert-logs'

function MyApp({ Component, pageProps }: AppProps) {
    return <>
        <AlertLogs />
        <Component {...pageProps} />
    </>
}

export default MyApp
