import {
  Banner, Form, Layout, PageActions, Toast, Spinner
} from '@shopify/polaris';
import { Mutation } from 'react-apollo';
import _ from 'lodash';
import { Component } from 'react';

import { ENDLESS_UPDATE_CLOSET } from '../graphql/variables';
import { updateCustomerClosetMeta } from '../graphql/mutations';

class UpdateCloset extends Component {
  state = {
    showToast: false
  }

  render() {
    const { showToast } = this.state;

    return (
      <Mutation
        mutation={updateCustomerClosetMeta}
        onCompleted={(data) => {
          this.props.onUpdateCloset(JSON.parse(data.customerUpdate.customer.metafields.edges[0].node.value).items);
        }}
      >
        {(handleSubmit, { error, loading }) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Updating Closet ... </div>
          );
          const showSuccess = showToast && (
            <Toast
              content="Sucessfully updated"
              onDismiss={() => this.setState({ showToast: false })}
            />
          );
          const { customer, closet } = this.props;

          return (
            <Layout>
              {showSuccess}
              <Layout.Section>
                {showError}
              </Layout.Section>
              <Layout.Section>
                <Form>
                  {showLoading}
                  <PageActions
                    primaryAction={[
                      {
                        content: 'Update Closet',
                        onAction: () => {
                          const variables = {
                            input: ENDLESS_UPDATE_CLOSET(
                              customer,
                              { items: closet }
                            )
                          };
                          handleSubmit({
                            variables: variables,
                          }).then(() => {
                            this.setState({ showToast: true });
                          });
                        },
                      },
                    ]}
                  />
                </Form>
              </Layout.Section>
            </Layout>
          );
        }}
      </Mutation >
    );
  }

}

export default UpdateCloset;