import gql from 'graphql-tag';

const removeCustomerClosetMeta = gql`
  mutation removeCustomerClosetMeta($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
    }
  }
`;

export default removeCustomerClosetMeta;