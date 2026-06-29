import {useEffect, useRef, useState} from "preact/hooks";

export function InternationalShippingPolicy() {
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);

  const acceptedRef = useRef(false);
  const checkoutReadyRef = useRef(false);

  const countryCode = shopify.localization?.country?.v?.isoCode || "";
    // console.log("countryCode--", countryCode);

  const isInternational = countryCode && countryCode.toUpperCase() !== "US";

  useEffect(() => {
    const timer = setTimeout(() => {
      checkoutReadyRef.current = true;
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isInternational) {
      setAccepted(false);
      acceptedRef.current = false;
      setShowError(false);
    }
  }, [isInternational]);

  useEffect(() => {
    const unsubscribe = shopify.buyerJourney.intercept(({canBlockProgress}) => {
      if (!isInternational) {
        setShowError(false);
        return {behavior: "allow"};
      }

      if (!checkoutReadyRef.current) {
        setShowError(false);
        return {behavior: "allow"};
      }

      if (!acceptedRef.current && canBlockProgress) {
        if (globalThis.hpCheckoutAction === "express" || globalThis.hpCheckoutAction === "signature") {
            return {behavior: "allow"};
        }
        setShowError(true);

        return {
          behavior: "block",
          reason: "International shipping policy must be accepted",
        };
      }

      return {behavior: "allow"};
    });

    return unsubscribe;
  }, [isInternational]);

  if (!isInternational) return null;

  return (
    <s-box padding="base">
      <s-banner tone={showError ? "critical" : "info"}>
        <s-stack gap="base">
          <s-text>
            Ships in 7–10 business days, up to 30 days with customs. Customs
            fees may apply. No returns on international orders.
          </s-text>

          <s-divider />

          <s-grid gridTemplateColumns="auto 1fr" gap="base" alignItems="start">
            <s-checkbox checked={accepted} onChange={onCheckboxChange} />

            <s-stack gap="small">
              <s-text>
                I’ve read and agree to the International Shipping & Returns
                Policy.
              </s-text>

              {showError && (
                <s-text tone="critical">
                  Please confirm the International Shipping & Returns Policy to
                  continue.
                </s-text>
              )}
            </s-stack>
          </s-grid>
        </s-stack>
      </s-banner>
    </s-box>
  );

  function setHpAction(action) {
  globalThis.hpCheckoutAction = action;

  setTimeout(() => {
    if (globalThis.hpCheckoutAction === action) {
      globalThis.hpCheckoutAction = "";
    }
  }, 800);
}

  async function onCheckboxChange(event) {
    const isChecked = event.target.checked;

    setHpAction("international");

    setAccepted(isChecked);
    acceptedRef.current = isChecked;

    if (isChecked) {
      setShowError(false);
    }

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "international_policy_ok",
      value: isChecked ? "Yes" : "No",
    });
  }
}