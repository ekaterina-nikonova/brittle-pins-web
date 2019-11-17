import React from "react";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import { gql } from "apollo-boost";

import { baseUrl } from "./api";

const httpLink = createHttpLink({
  uri: `${baseUrl}/api/v1/graphql`,
  credentials: 'include',
  headers: { 'X-CSRF-TOKEN': localStorage.csrf }
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

export const Apollo = ({children}) => (
  <ApolloProvider client={client}>
    {children}
  </ApolloProvider>
);

export const queries = {
  projects: gql`{
    projects { id, name }
  }`,
  boardNames: gql` {
    boards { id, name }
  }`,
};
