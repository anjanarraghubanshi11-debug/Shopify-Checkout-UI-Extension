import {useEffect, useRef, useState} from "preact/hooks";

export function RxCheckoutForm() {
  const [showError, setShowError] = useState(false);

  const [petName, setPetName] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetPhone, setVetPhone] = useState("");

  const rxCompletedRef = useRef(false);
  const hasRxProductRef = useRef(false);

  const attributes = shopify.attributes.value || [];

  const getAttribute = (key) => {
    return attributes.find((attr) => attr.key === key)?.value;
  };

  const hasRxProduct = getAttribute("has_rx_product") === "true";
  const rxFormCompleted = getAttribute("rx_form_completed") === "true";
    
  console.log("hasRxProduct--- "+hasRxProduct);
  console.log("rxFormCompleted --- "+rxFormCompleted);


  useEffect(() => {
    hasRxProductRef.current = hasRxProduct;
    rxCompletedRef.current = rxFormCompleted;
  }, [hasRxProduct, rxFormCompleted]);

  useEffect(() => {
    const unsubscribe = shopify.buyerJourney.intercept(({canBlockProgress}) => {
      const latestHasRx = hasRxProductRef.current;
      const latestRxCompleted = rxCompletedRef.current;

      if (!latestHasRx) {
        setShowError(false);
        return {behavior: "allow"};
      }

      if (latestHasRx && !latestRxCompleted) {
        setShowError(true);

        if (canBlockProgress) {
          return {
            behavior: "block",
            reason: "RX form is required",
            errors: [
              {
                message:
                  "Please complete the prescription information before placing your order.",
              },
            ],
          };
        }
      }

      setShowError(false);
      return {behavior: "allow"};
    });

    return unsubscribe;
  }, []);

  if (!hasRxProduct || rxFormCompleted) {
    return null;
  }

  return (
    <s-box padding="base">
      <s-banner heading="Prescription Information Required" tone="warning">
        <s-stack gap="base">
          <s-text>
            Your cart contains prescription product(s). Please complete the RX
            information before placing your order.
          </s-text>

          <s-text-field
            label="Pet name"
            value={petName}
            onInput={(event) => setPetName(event.target.value)}
          />

          <s-text-field
            label="Veterinarian name"
            value={vetName}
            onInput={(event) => setVetName(event.target.value)}
          />

          <s-text-field
            label="Veterinarian phone"
            value={vetPhone}
            onInput={(event) => setVetPhone(event.target.value)}
          />

          {showError && (
            <s-banner tone="critical">
              Please complete and save the RX form before placing your order.
            </s-banner>
          )}

          <s-button onClick={saveRxForm}>Save RX information</s-button>
        </s-stack>
      </s-banner>
    </s-box>
  );

  async function saveRxForm() {
    if (!petName || !vetName || !vetPhone) {
      setShowError(true);
      rxCompletedRef.current = false;
      return;
    }

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "rx_form_completed",
      value: "true",
    });

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "rx_pet_name",
      value: petName,
    });

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "rx_vet_name",
      value: vetName,
    });

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "rx_vet_phone",
      value: vetPhone,
    });

    rxCompletedRef.current = true;
    setShowError(false);
  }
}