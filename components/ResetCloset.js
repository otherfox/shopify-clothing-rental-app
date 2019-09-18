import gql from 'graphql-tag';
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
import moment from 'moment';
import uuid from 'uuid/v1';

import { ENDLESS_CUSTOMER_CREATE_CLOSET, ENDLESS_CUSTOMER_UPDATE_CLOSET, ENDLESS_DATE_FORMAT } from '../constants';

// remove customer meta
const REMOVE_CUSTOMER_CLOSET_META = gql`
  mutation removeCustomerClosetMeta($input: MetafieldDeleteInput!) {
    metafieldDelete(input: $input) {
      deletedId
    }
  }
`;

class ResetCloset extends Component {
  state = {
    showToast: true
  }

  render() {
    const { showToast } = this.state;

    return (
      <Mutation
        mutation={this.props.mutation}
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
                              input: ENDLESS_CUSTOMER_UPDATE_CLOSET(customer, {
                                items: this.props.closet,
                                orders: this.props.orders.concat([{ id: uuid(), date: moment().format(ENDLESS_DATE_FORMAT) }])
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
                            variables: { input: ENDLESS_CUSTOMER_CREATE_CLOSET(customer) },
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
                            mutation: REMOVE_CUSTOMER_CLOSET_META,
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