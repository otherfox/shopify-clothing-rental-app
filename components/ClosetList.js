import gql from 'graphql-tag';
import {
  Card,
  ResourceList,
  Stack,
  TextStyle
} from '@shopify/polaris';
import { Query } from 'react-apollo';
import { Redirect } from '@shopify/app-bridge/actions';
import { AppBridgeContext } from '@shopify/app-bridge-react/context';
import store from 'store-js';

import { ENDLESS_CUSTOMERS_QUERY } from '../constants';

// Get List of Endless Customers
const GET_ENDLESS_CUSTOMERS = gql`
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

class ClosetList extends React.Component {
  static contextType = AppBridgeContext;

  redirectToCloset = () => {
    const app = this.context;
    const redirect = Redirect.create(app);
    redirect.dispatch(
      Redirect.Action.APP,
      '/view-closet',
    );
  };

  render() {
    return (
      <Query query={GET_ENDLESS_CUSTOMERS} variables={ENDLESS_CUSTOMERS_QUERY}>
        {({ data, loading, error }) => {
          if (loading) return <div>Loading…</div>;
          if (error) return <div>{error.message}</div>;
          return (
            <Card>
              <ResourceList
                items={data.customers.edges}
                renderItem={item => {
                  const customer = item.node;
                  return (
                    <ResourceList.Item
                      id={customer.id}
                      accessibilityLabel={`View details for ${customer.displayName}`}
                      onClick={() => {
                        console.log('Routing to customer: ', customer.id);
                        store.set('customer', customer.id);
                        this.redirectToCloset();
                      }}
                    >
                      <Stack>
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation="strong">
                              {customer.displayName}
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                        <Stack.Item>
                          <p>
                            {customer.tags.map(tag => (<span key={tag}>{tag}</span>))}
                          </p>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
            </Card>
          );
        }}
      </Query>
    );
  }
}

export default ClosetList;