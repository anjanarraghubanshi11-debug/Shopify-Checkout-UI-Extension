import {useState} from "preact/hooks";

export function OrderSummaryInfo() {
  const [showMore, setShowMore] = useState(false);

  const totalAmount = Number(shopify.cost.totalAmount.current.amount) || 0;
  const requiresSignature = totalAmount >= 200;

  if (!requiresSignature) return null;

  return (
    <s-box padding="base">
      <s-stack gap="small">
        <s-text>
          Orders over $200 require a signature on delivery —{" "}
          <s-link onClick={() => setShowMore(!showMore)}>
            Learn more
          </s-link>
        </s-text>

        {showMore && (
          <s-text>
            Orders with a subtotal over $200 require an adult signature at
            delivery. This extra step helps make sure a higher-value order
            reaches you directly rather than being left unattended.
          </s-text>
        )}
      </s-stack>
    </s-box>
  );
}