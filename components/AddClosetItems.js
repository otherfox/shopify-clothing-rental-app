import { Banner, Layout, Page, Spinner } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/app-bridge-react';
import { Mutation } from 'react-apollo';;
import _ from 'lodash';

import { ENDLESS_ADD_ITEMS, ENDLESS_UPDATE_CLOSET } from '../graphql/variables';
import { updateCustomerClosetMeta } from '../graphql/mutations';

const AddClosetItems = props => {
  return (
    <Page>
      <Mutation
        mutation={updateCustomerClosetMeta}
        onCompleted={data => {
          props.onUpdateCloset(JSON.parse(data.customerUpdate.customer.metafields.edges[0].node.value).items);
          props.hideAddItems();
        }}
      >
        {(handleSubmit, { error, loading }) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Adding Items ... </div>
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
                  showVariants={true}
                  open={props.open}
                  onSelection={(resources) => {
                    const items = resources.selection.map(i => ({ id: i.id, variantIds: i.variants.map(v => v.id), order: props.order }));
                    const newCloset = ENDLESS_ADD_ITEMS(customer.metafield.value, items);
                    const variables = { input: ENDLESS_UPDATE_CLOSET(customer, { items: newCloset }) };
                    handleSubmit({
                      variables: variables,
                      refetchQueries: props.refetchQueries
                    });
                  }}
                  onCancel={() => props.hideAddItems()}
                />
              </Layout.Section>
              {showLoading}
            </Layout>
          )
        }}
      </Mutation>
    </Page >
  );
}

export default AddClosetItems;