
import '../styles/globals.css';
import type { AppProps } from 'next/app';
// import { useRouter } from 'next/router';
import Head from 'next/head';
import { ComponentType, ReactElement, ReactNode } from 'react';
import { NextPage } from 'next';
import React from 'react';
import PageContainer from '../components/Layouts/PageContainer';
export type NextPageWithLayout<P = unknown> = NextPage<P> & {
  getLayout?: (_page: ReactElement) => ReactNode;
  layout?: ComponentType;
};
interface AppPropsWithLayout extends AppProps {
  Component: NextPageWithLayout;
}


function Container({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>
          title
        </title>
      </Head>
      {children}
    </>
  );
}

function MyApp({ Component, ...rest }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page);

  return getLayout(
    <Container>
      <PageContainer>
        <Component {...rest.pageProps} />
      </PageContainer>
    </Container>
  );
}

export default MyApp;
