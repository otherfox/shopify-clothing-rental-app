import gql from 'graphql-tag';

const getEndlessCustomers = gql`
  query getCustomers($query: String!) {
    customers(first: 5, query: $query) {
      edges {
        node {
          id
          displayName
          tags
        }
      }
    }
  }
`;

export default getEndlessCustomers;