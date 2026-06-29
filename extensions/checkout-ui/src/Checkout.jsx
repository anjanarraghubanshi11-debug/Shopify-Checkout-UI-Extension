import "@shopify/ui-extensions/preact";
import {render} from "preact";

import {ExpressShippingPolicy} from "./ExpressShippingPolicy.jsx";
// import {RxCheckoutForm} from "./RxCheckoutForm.jsx";
import {SignatureRequired} from "./SignatureRequired.jsx";
import {InternationalShippingPolicy} from "./InternationalShippingPolicy.jsx";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  return (
    <s-stack gap="base">
      <ExpressShippingPolicy />
      {/* <RxCheckoutForm /> */}
      <SignatureRequired />
      <InternationalShippingPolicy />
    </s-stack>
  );
}