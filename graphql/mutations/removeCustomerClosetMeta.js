const gql = require('graphql-tag');

const removeCustomerClosetMeta = gql`
  mutation removeCustomerClosetMeta($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
    }
  }
`;

module.exports = { removeCustomerClosetMeta };