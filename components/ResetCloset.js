import {
  Banner, Form, Layout, PageActions, Toast, Spinner
} from '@shopify/polaris';
import { Mutation } from 'react-apollo';
import _ from 'lodash';
import { Component } from 'react';
import moment from 'moment';
import uuid from 'uuid/v1';

import { ENDLESS_CREATE_CLOSET, ENDLESS_UPDATE_CLOSET, ENDLESS_DATE_FORMAT } from '../graphql/variables';
import { updateCustomerClosetMeta, removeCustomerClosetMeta } from '../graphql/mutations';

class ResetCloset extends Component {
  state = {
    showToast: true
  }

  render() {
    const { showToast } = this.state;

    return (
      <Mutation
        mutation={updateCustomerClosetMeta}
        refetchQueries={this.props.refetchQueries}
        onCompleted={
          (data) => console.log('updated customer closet', data)
        }
      >
        {(handleSubmit, { error, loading, data }) => {
          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Loading ... </div>
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
                {showLoading}
              </Layout.Section>
              <Layout.Section>
                <Form>
                  <PageActions
                    primaryAction={[
                      {
                        content: 'Create Order',
                        onAction: () => {
                          console.log('Create Order');

                          handleSubmit({
                            variables: {
                              input: ENDLESS_UPDATE_CLOSET(customer, {
                                items: this.props.closet,
                                order: { id: uuid(), date: moment().format(ENDLESS_DATE_FORMAT) }
                              })
                            },
                          });
                        },
                      },
                    ]}
                  />
                  <PageActions
                    primaryAction={[
                      {
                        content: 'Recreate Closet',
                        onAction: () => {
                          console.log('recreate closet');
                          handleSubmit({
                            variables: { input: ENDLESS_CREATE_CLOSET(customer) },
                          });
                        },
                      },
                    ]}
                    secondaryActions={[
                      {
                        content: 'Delete Closet',
                        disabled: !customer.metafield,
                        onAction: () => {
                          console.log('remove closet metafield:', customer.metafield.id);
                          handleSubmit({
                            mutation: removeCustomerClosetMeta,
                            variables: { input: { id: customer.metafield.id } },
                            refetchQueries: this.props.refetchQueries
                          })
                        }
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

export default ResetCloset;