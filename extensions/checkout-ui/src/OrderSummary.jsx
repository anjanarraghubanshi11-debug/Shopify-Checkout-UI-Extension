import "@shopify/ui-extensions/preact";
import {render} from "preact";

// import {SignatureRequired} from "./SignatureRequired.jsx";
import {OrderSummaryInfo} from "./OrderSummaryInfo.jsx";

export default async () => {
  render(<OrderSummary />, document.body);
};

function OrderSummary() {
  return (
    <s-stack gap="base">
      <OrderSummaryInfo />
      {/* <SignatureRequired /> */}

    </s-stack>
  );
}