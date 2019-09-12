import { Page, Layout, Banner, Spinner, Toast, ThemeProvider } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import { Mutation } from 'react-apollo';;
import _ from 'lodash';

import { ENDLESS_CUSTOMER_UPDATE_CLOSET, ENDLESS_CUSTOMER_ADD_ITEMS } from '../constants'


class AddClosetItems extends React.Component {
  state = {
    showToast: false
  };

  render() {
    let { showToast } = this.state;
    return (
      <Page>
        <Mutation
          mutation={this.props.mutation}
          refetchQueries={this.props.refetchQueries}
        >
          {(handleSubmit, { error, loading, data }) => {
            const showError = error && (
              <Banner status="critical">{error.message}</Banner>
            );
            const customer = this.props.customer;
            return (
              <Layout>
                <Layout.Section>
                  {showError}
                </Layout.Section>
                <Layout.Section>
                  <ResourcePicker
                    resourceType="Product"
                    showVariants={false}
                    open={this.props.open}
                    onSelection={(resources) => {
                      const ids = _.map(resources.selection, 'id');
                      const newCloset = ENDLESS_CUSTOMER_ADD_ITEMS(customer.metafield.value, ids);
                      const variables = { input: ENDLESS_CUSTOMER_UPDATE_CLOSET(customer, newCloset) };

                      this.props.onUpdateCloset(newCloset);
                      this.props.hideAddItems();

                      handleSubmit({
                        variables: variables,
                        refetchQueries: this.props.refetchQueries
                      });
                    }}
                    onCancel={() => this.props.hideAddItems()}
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