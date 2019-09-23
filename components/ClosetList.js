import {
  Card, ResourceList, Spinner, Stack, TextStyle
} from '@shopify/polaris';
import { Query } from 'react-apollo';
import Router from 'next/router';
import { AppBridgeContext } from '@shopify/app-bridge-react/context';

import { ENDLESS_CUSTOMERS_TAGS } from '../graphql/variables';
import { getEndlessCustomers } from '../graphql/queries';

class ClosetList extends React.Component {
  static contextType = AppBridgeContext;

  redirectToCloset = (id) => {
    Router.push({
      pathname: '/view-closet',
      query: { id: id }
    });
  };

  render() {
    return (
      <Query query={getEndlessCustomers} variables={ENDLESS_CUSTOMERS_TAGS}>
        {({ data, loading, error }) => {
          if (loading) return <div><Spinner size="small" color="teal" /> Fetching Closets…</div>;
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
                        this.redirectToCloset(customer.id);
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