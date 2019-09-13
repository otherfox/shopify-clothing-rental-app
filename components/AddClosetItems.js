import { Page, Layout, Banner } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import { Mutation } from 'react-apollo';;
import _ from 'lodash';

import { ENDLESS_CUSTOMER_UPDATE_CLOSET, ENDLESS_CUSTOMER_ADD_ITEMS } from '../constants'


const AddClosetItems = props => {
  return (
    <Page>
      <Mutation
        mutation={props.mutation}
        refetchQueries={props.refetchQueries}
      >
        {(handleSubmit, { error }) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const customer = props.customer;
          return (
            <Layout>
              <Layout.Section>
                {showError}
              </Layout.Section>
              <Layout.Section>
                <ResourcePicker
                  resourceType="Product"
                  showVariants={false}
                  open={props.open}
                  onSelection={(resources) => {
                    const ids = _.map(resources.selection, 'id');
                    const newCloset = ENDLESS_CUSTOMER_ADD_ITEMS(customer.metafield.value, ids);
                    const variables = { input: ENDLESS_CUSTOMER_UPDATE_CLOSET(customer, newCloset) };

                    props.onUpdateCloset(newCloset);
                    props.hideAddItems();

                    handleSubmit({
                      variables: variables,
                      refetchQueries: props.refetchQueries
                    });
                  }}
                  onCancel={() => props.hideAddItems()}
                />
              </Layout.Section>
            </Layout>
          )
        }}
      </Mutation>
    </Page >
  );
}
}

export default AddClosetItems;