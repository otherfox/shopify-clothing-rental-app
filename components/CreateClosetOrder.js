import {
  Banner,
  Form,
  Layout,
  PageActions,
  Toast,
  Spinner,
  Button,
  ThemeProvider
} from '@shopify/polaris';
import { Mutation, useMutation, useQuery } from 'react-apollo';
import _ from 'lodash';
import { Component, useState, useEffect } from 'react';

import { ENDLESS_ORDER_CREATE, ENDLESS_ITEM_RETURN_STATUS } from '../constants';

class CreateClosetOrder extends Component {
  state = {
    createdClosetCompleted: false
  }

  render() {
    const {
      customer, closet, membership, mutation, refetchQueries,
      completeMutation, fullfillMutation, locationsQuery
    } = this.props;

    const { createdClosetCompleted } = this.state;

    return (
      <Mutation
        mutation={mutation}
        onCompleted={
          (data) => {
            console.log('created endless order', data)
            this.setState({ createdClosetCompleted: true });
          }
        }
      >
        {(handleSubmit, { error, loading, data }) => {

          const showError = error && (
            <Banner status="critical">{error.message}</Banner>
          );
          const showLoading = loading && (
            <div><Spinner size="small" color="teal" /> Creating Order ... </div>
          );

          const showSuccess = data && data.draftOrderCreate && createdClosetCompleted && (
            <CompleteOrder
              draftOrder={data.draftOrderCreate.draftOrder}
              mutation={completeMutation}
              fullfillMutation={fullfillMutation}
              locationsQuery={locationsQuery}
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
                        content: 'Create Closet Order',
                        onAction: () => {
                          const items = closet.filter(i => i.status == ENDLESS_ITEM_RETURN_STATUS).map(i => i.id);
                          const variables = {
                            input: ENDLESS_ORDER_CREATE(
                              customer,
                              membership,
                              items
                            )
                          };
                          console.log('create closet order variables:', JSON.stringify(variables));
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
  const { draftOrder, mutation, refetchQueries, locationsQuery, fullfillMutation } = props;
  const [completeOrderCompleted, setCompleteOrderCompleted] = useState(false);
  const [draftOrderComplete, { loading, error, data, called }] = useMutation(mutation, {
    onCompleted: (data) => {
      console.log('order draft completed and marked paid: ', data);
    }
  });

  useEffect(() => {
    if (!data) {
      draftOrderComplete({
        variables: { id: draftOrder.id, paymentPending: false }
      });
      setCompleteOrderCompleted(true);
    }
  });

  const showError = error && (
    <Banner status="critical">{error.message}</Banner>
  );
  const showLoading = loading && (
    <div><Spinner size="small" color="teal" /> Completing Order ... </div>
  );

  const showSuccess = data && data.draftOrderComplete && completeOrderCompleted && (
    <FullfillOrder
      draftOrder={data.draftOrderComplete.draftOrder}
      mutation={fullfillMutation}
      refetchQueries={refetchQueries}
      locationsQuery={locationsQuery}
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
  const [showToast, setShowToast] = useState(true);
  const [fulfillOrderCompleted, setFullfillOrderCompleted] = useState(false);
  const { draftOrder, mutation, refetchQueries, locationsQuery } = props;
  const [fulfillmentCreate, {
    loading: mutationLoading,
    error: mutationError,
    called
  }] = useMutation(mutation, {
    onCompleted: data => {
      console.log('order fulfilled: ', data);
      setFullfillOrderCompleted(true);
    }
  });
  const { loading: queryLoading, error: queryError, data } = useQuery(locationsQuery);

  useEffect(() => {
    if (data && data.locations && !called) {
      console.log('fulfill order:', draftOrder);
      fulfillmentCreate({
        variables: { input: { orderId: draftOrder.order.id, locationId: data.locations.edges[0].node.id } }
      });
    }
  });

  const showQueryError = queryError && (
    <Banner status="critical">{queryError.message}</Banner>
  );
  const showQueryLoading = queryLoading && (
    <div><Spinner size="small" color="teal" /> Assigning Location ... </div>
  );
  const showMutationError = mutationError && (
    <Banner status="critical">{mutationError.message}</Banner>
  );
  const showMutationLoading = mutationLoading && (
    <div><Spinner size="small" color="teal" /> Fullfilling Order ... </div>
  );
  const showSuccess = called && showToast && fulfillOrderCompleted && (
    <Toast
      content="Order Created, Completed, and Fullfilled"
      onDismiss={() => setShowToast(false)}
    />
  );

  return (
    <div>
      {showSuccess}
      {showQueryError}
      {showQueryLoading}
      {showMutationError}
      {showMutationLoading}
    </div>
  )
}

export default CreateClosetOrder;