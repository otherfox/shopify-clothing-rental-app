import {
  Banner,
  Form,
  Layout,
  PageActions,
  Toast,
  Spinner
} from '@shopify/polaris';
import { Mutation } from 'react-apollo';
import _ from 'lodash';
import { Component } from 'react';

import { ENDLESS_CUSTOMER_UPDATE_CLOSET } from '../constants';

class UpdateCloset extends Component {
  state = {
    showToast: true
  }

  render() {
    const { showToast } = this.state;

    return (
      <Mutation
        mutation={this.props.mutation}
        refetchQueries={this.props.refetchQueries}
        update={(cache, { data: { customerUpdate: { customer } } }) => {
          const cachedCustomer = cache.readQuery(this.props.refetchQueries[0]).customer;
          const { metafields: { edges: [{ node }] } } = customer;
          cache.writeQuery({
            query: this.props.refetchQueries[0].query,
            data: { customer: _.assignIn(cachedCustomer, { metafield: node }) }
          })
        }}
        onCompleted={
          (data) => console.log('updated customer closet', data)
        }
      >
        {(handleSubmit, { error, loading, data }) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Updating Closet ... </div>
          );
          const showSuccess = data && data.customerUpdate && showToast && (
            <Toast
              content="Sucessfully updated"
              onDismiss={() => this.setState({ showToast: false })}
            />
          );
          const customer = this.props.customer;

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
                          console.log('update customer closet:', customer.metafield.id, 'new closet:', this.props.closet);
                          const variables = { input: ENDLESS_CUSTOMER_UPDATE_CLOSET(customer, this.props.closet) };
                          handleSubmit({
                            variables: variables,
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