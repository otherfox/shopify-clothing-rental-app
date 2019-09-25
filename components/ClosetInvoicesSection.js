import {
  Card, ResourceList, Stack, TextStyle,
  Layout, Button, Collapsible,
  TextContainer, Heading, FormLayout
} from '@shopify/polaris';
import { useState } from 'react';
import _ from 'lodash';

const ClosetInvoicesSection = props => {
  const { customer } = props;
  const [open, setOpen] = useState(false);

  return (
    <Layout.Section>
      <Card sectioned>
        <Heading variation="strong">Invoices</Heading>
        <FormLayout>
          <Button
            onClick={() => setOpen(!open)}
            ariaExpanded={open}
            ariaControls="ordersList"
          >
            Toggle Data
          </Button>
        </FormLayout>
        <Collapsible open={open} id="invoiceList">
          <ResourceList
            items={customer.orders.edges}
            renderItem={({ node }) => (
              <ResourceList.Item
                id={node.id}
              >
                <Stack>
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">
                        Invoice # {node.id}
                      </TextStyle>
                    </h3>
                  </Stack.Item>
                  <Stack.Item>
                    <TextStyle variation="subdued">Date Ordered</TextStyle>
                    <TextContainer>{node.createdAt}</TextContainer>
                  </Stack.Item>
                  <Stack.Item>
                    <TextStyle variation="subdued">Items</TextStyle>
                    <TextContainer>{node.lineItems.edges.map(i => {
                      return (
                        <div key={i.node.variantId}>
                          <TextStyle variation="subdued">{`Product ID: ${i.node.product.id} Variant ID: ${i.node.variant.id}`}</TextStyle>
                        </div>
                      )
                    })}</TextContainer>
                  </Stack.Item>
                </Stack>
              </ResourceList.Item>
            )}
          />
        </Collapsible>
      </Card>
    </Layout.Section>
  )
}

export default ClosetInvoicesSection;