const gql = require('graphql-tag');

const updateCustomerTags = gql`
  mutation {
    customerUpdate(input: { $id: ID!, tags: [] }) {
        customer {
            id
            tags
        }
    }
}
`;

module.exports = { updateCustomerTags };


