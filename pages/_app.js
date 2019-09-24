import App from 'next/app';
import Head from 'next/head';
import { AppProvider } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import '@shopify/polaris/styles.css';
import Cookies from 'js-cookie';
import ApolloClient from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';

const client = new ApolloClient({
  fetchOptions: {
    credentials: 'include'
  },
  link: createHttpLink({
    uri: '/graphql',
    fetch: fetch
  }),
  cache: new InMemoryCache()
});


class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    const config = { apiKey: API_KEY, shopOrigin: Cookies.get("shopOrigin"), forceRedirect: true };
    return (
      <React.Fragment>
        <Head>
          <title>Charlotte's Closet</title>
          <meta charSet="utf-8" />
        </Head>
        <Provider config={config}>
          <AppProvider>
            <ApolloProvider client={client}>
              <Component {...pageProps} />
            </ApolloProvider>
          </AppProvider>
        </Provider>
      </React.Fragment>
    );
  }
}

export default MyApp;