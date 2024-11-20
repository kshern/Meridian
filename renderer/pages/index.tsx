import type { ReactElement } from 'react'
import type { NextPageWithLayout } from './_app'
import dynamic from 'next/dynamic';
import Layout from '../components/Layouts/Layout';
const HomeComponent = dynamic(async () => await import('./home'), {
    ssr: false,
});


const Page: NextPageWithLayout = () => {
    return <div>
        <HomeComponent />
    </div>
}

Page.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default Page