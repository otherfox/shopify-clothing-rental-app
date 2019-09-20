import {
  Banner, Form, Layout, PageActions, Toast, Spinner
} from '@shopify/polaris';
import { Mutation, useMutation, useQuery } from 'react-apollo';
import _ from 'lodash';
import { Component, useState, useEffect } from 'react';

import {
  ENDLESS_CREATE_ORDER, ENDLESS_ITEM_SHIPPED_STATUS, ENDLESS_UPDATE_CLOSET
} from '../graphql/variables';
import {
  createCustomerOrder, completeCustomerOrder, fulfillCustomerOrder, updateCustomerClosetMeta
} from '../graphql/mutations';
import { getLocations } from '../graphql/queries';

class CreateClosetOrder extends Component {
  state = {
    createdClosetCompleted: false
  }

  render() {
    const {
      customer, closet, membership, refetchQueries
    } = this.props;

    const { createdClosetCompleted } = this.state;

    return (
      <Mutation
        mutation={createCustomerOrder}
        onCompleted={() => this.setState({ createdClosetCompleted: true })}
      >
        {(handleSubmit, { error, loading, data }) => {

          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Creating Order ... </div>
          );

          const showSuccess = data && createdClosetCompleted && (
            <CompleteOrder
              draftOrder={data.draftOrderCreate.draftOrder}
              closet={closet}
              customer={customer}
              refetchQueries={refetchQueries} />
          );

          return (
            <Layout>
              <Layout.Section>
                {showError}
              </Layout.Section>
              <Layout.Section>
                <Form>
                  {showLoading}
                  {showSuccess}
                  <PageActions
                    primaryAction={[
                      {
                        content: 'Update Closet',
                        onAction: () => {
                          let itemIds = []
                          closet
                            .filter(i => i.status == ENDLESS_ITEM_SHIPPED_STATUS)
                            .forEach(i => i.variantIds.forEach(j => itemIds.push(j)));
                          const variables = {
                            input: ENDLESS_CREATE_ORDER(
                              customer,
                              membership,
                              itemIds
                            )
                          };
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

const CompleteOrder = props => {
  const {
    draftOrder, refetchQueries, closet, customer
  } = props;
  const [completeOrderCompleted, setCompleteOrderCompleted] = useState(false);
  const [draftOrderComplete, { loading, error, data, called }] = useMutation(completeCustomerOrder, {
    onCompleted: () => setCompleteOrderCompleted(true)
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!called) {
      draftOrderComplete({
        variables: { id: draftOrder.id, paymentPending: false },
        options: {
          context: { fetchOptions: { signal: signal } }
        }
      });
    }
    return function cleanup() {
      abortController.abort();
    }
  }, []);

  const showError = error && (
    <Banner status="critical">{error.message}</Banner>
  );
  const showLoading = loading && (
    <div><Spinner size="small" color="teal" /> Completing Order ... </div>
  );

  const showSuccess = data && data.draftOrderComplete && completeOrderCompleted && (
    <GetLocation
      orderId={data.draftOrderComplete.draftOrder.order.id}
      closet={closet}
      customer={customer}
      refetchQueries={refetchQueries}
    />
  );

  return (
    <div>
      {showSuccess}
      {showError}
      {showLoading}
    </div>
  )
}

const GetLocation = props => {
  const [getLocationCompleted, setGetLocationCompleted] = useState(false);
  const {
    orderId, refetchQueries, closet, customer
  } = props;
  const { loading, error, data, called } = useQuery(getLocations, {
    onCompleted: () => setGetLocationCompleted(true)
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!called) {
      console.log('calling get locations');
      getLocations({
        options: {
          context: { fetchOptions: { signal: signal } }
        }
      });
    }
    return function cleanup() {
      abortController.abort();
    }
  }, []);

  const showError = error && (
    <Banner status="critical">{queryError.message}</Banner>
  );
  const showLoading = loading && (
    <div><Spinner size="small" color="teal" /> Assigning Location ... </div>
  );

  const showSuccess = getLocationCompleted && (
    <FullfillOrder
      locationId={data.locations.edges[0].node.id}
      refetchQueries={refetchQueries}
      closet={closet}
      customer={customer}
      draftOrderId={orderId}
    />
  );

  return (
    <div>
      {showSuccess}
      {showError}
      {showLoading}
    </div>
  )
}

const FullfillOrder = props => {
  const [fulfillOrderCompleted, setFullfillOrderCompleted] = useState(false);
  const {
    draftOrderId, locationId, refetchQueries, closet, customer
  } = props;
  const [fulfillmentCreate, {
    loading, error, data, called
  }] = useMutation(fulfillCustomerOrder, {
    onCompleted: () => setFullfillOrderCompleted(true)
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!called) {
      fulfillmentCreate({
        variables: {
          input: {
            orderId: draftOrderId,
            locationId: locationId
          }
        },
        options: {
          context: { fetchOptions: { signal: signal } }
        }
      });
    }
    return function cleanup() {
      abortController.abort();
    }
  }, []);

  const showError = error && (
    <Banner status="critical">{error.message}</Banner>
  );
  const showLoading = loading && (
    <div><Spinner size="small" color="teal" /> Fullfilling Order ... </div>
  );
  const showSuccess = fulfillOrderCompleted && (
    <UpdateClosetFunc
      refetchQueries={refetchQueries}
      closet={closet}
      customer={customer}
      orderId={data.fulfillmentCreate.order.id}
    />
  );

  return (
    <div>
      {showSuccess}
      {showError}
      {showLoading}
    </div>
  )
}

const UpdateClosetFunc = props => {
  const {
    refetchQueries, closet, orderId, customer
  } = props;
  const [showToast, setShowToast] = useState(true);
  const [updateClosetCompleted, setUpdateClosetCompleted] = useState(false);
  const [updateCloset, { loading, error, called }] = useMutation(updateCustomerClosetMeta, {
    onCompleted: () => {
      setUpdateClosetCompleted(true);
    }
  });

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;
    if (!called) {
      // Add invoice number to newly shipped items
      const newCloset = closet.map(i => {
        if (i.status == ENDLESS_ITEM_SHIPPED_STATUS && !i.invoice) {
          i.invoice = orderId;
        }
        return i;
      });
      const variables = {
        input: ENDLESS_UPDATE_CLOSET(
          customer,
          { items: newCloset }
        )
      };
      updateCloset({
        variables: variables,
        refetchQueries: refetchQueries,
        options: {
          context: { fetchOptions: { signal: signal } }
        }
      });
    }
    return function cleanup() {
      abortController.abort();
    }
  }, []);

  const showError = error && (
    <Banner status="critical">{error.message}</Banner>
  );
  const showLoading = loading && (
    <div><Spinner size="small" color="teal" /> Updating Closet ... </div>
  );

  const showSuccess = updateClosetCompleted && showToast && (
    <Toast
      content="Order created, completed, and fulfilled. Closet updated"
      onDismiss={() => setShowToast(false)}
    />
  );

  return (
    <div>
      {showSuccess}
      {showError}
      {showLoading}
    </div>
  )
}

export default CreateClosetOrder;