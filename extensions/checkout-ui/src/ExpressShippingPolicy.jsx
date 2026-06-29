import {useEffect, useRef, useState} from "preact/hooks";

function setHpAction(action) {
  globalThis.hpCheckoutAction = action;

  setTimeout(() => {
    if (globalThis.hpCheckoutAction === action) {
      globalThis.hpCheckoutAction = "";
    }
  }, 800);
}

export function ExpressShippingPolicy() {   
    const [accepted, setAccepted] = useState(false);
    const [showError, setShowError] = useState(false);
  
    const acceptedRef = useRef(false);
    const isExpressRef = useRef(false);
    const hasTriedSubmitRef = useRef(false);
    const checkoutReadyRef = useRef(false);

    const deliveryGroups = shopify.deliveryGroups.value || [];
  
    // Get the selected delivery handle from deliveryGroups
    const selectedOptions = deliveryGroups
      .map((group) => {
        const selectedHandle = group.selectedDeliveryOption?.handle;
  
        return group.deliveryOptions?.find(
          (option) => option.handle === selectedHandle,
        );
      })
      .filter(Boolean);
  
    // Get the selected delivery handle text and match the text with condition values
    const selectedShippingText = selectedOptions
      .map((option) =>
        [option.title, option.code, option.handle].filter(Boolean).join(" "),
      )
      .join(" ")
      .toLowerCase();
  
    const isExpressShipping =
      selectedShippingText.includes("express") ||
      selectedShippingText.includes("1-2") ||
      selectedShippingText.includes("1–2");
  
    // Keep latest shipping value available to intercept
      useEffect(() => {
        isExpressRef.current = isExpressShipping;

        if (!isExpressShipping) {
          hasTriedSubmitRef.current = false;
          setShowError(false);
          setAccepted(false);
          acceptedRef.current = false;
        }
      }, [isExpressShipping]);

      useEffect(() => {
        const timer = setTimeout(() => {
          checkoutReadyRef.current = true;
        }, 1200);

        return () => clearTimeout(timer);
      }, []);

   // console.log("INTERCEPT RUNNING", {
        //   canBlockProgress,
        //   latestIsExpress,
        //   latestAccepted,
        // });
    // Register intercept only once
    useEffect(() => {
      const unsubscribe = shopify.buyerJourney.intercept(({canBlockProgress}) => {
        const latestIsExpress = isExpressRef.current;
        const latestAccepted = acceptedRef.current;

        if (!latestIsExpress) {
          setShowError(false);
          return {behavior: "allow"};
        }

        // Do not show/block on checkout page initial load
        if (!checkoutReadyRef.current) {
          setShowError(false);
          return {behavior: "allow"};
        }

        // Show red box only when Shopify is trying to continue/pay
        if (latestIsExpress && !latestAccepted && canBlockProgress) {

          if (globalThis.hpCheckoutAction === "signature" || globalThis.hpCheckoutAction === "international") {
            return {behavior: "allow"};
          }

          setShowError(true);

          return {
            behavior: "block",
            reason: "Express shipping policy must be accepted",
          };
        }

        if (latestAccepted) {
          setShowError(false);
        }

        return {behavior: "allow"};
      });

      return unsubscribe;
    }, []);
  
    if (!isExpressShipping) {
      return null;
    }
  
  return (
    <s-box padding="base">
      <s-banner tone={showError ? "critical" : "info"}>
        <s-stack gap="base">
          <s-grid gridTemplateColumns="auto 1fr" gap="base" alignItems="start">
            <s-checkbox
              checked={accepted}
              onChange={onCheckboxChange}
            />

            <s-stack gap="small">
              <s-text>
                I’ve read and agree to the Express Shipping Policy, including that weekend
                and holiday orders ship the next business day.
              </s-text>

              {showError && (
                <s-text tone="critical">
                  Please confirm the Express Shipping Policy to continue.
                </s-text>
              )}
            </s-stack>
          </s-grid>
        </s-stack>
      </s-banner>
    </s-box>
  );

    async function onCheckboxChange(event) {
      const isChecked = event.target.checked;
  
      setHpAction("express");

      setAccepted(isChecked);
      acceptedRef.current = isChecked;
  
      if (isChecked) {
        setShowError(false);
      }
  
      const result = await shopify.applyAttributeChange({
        type: "updateAttribute",
        key: "express_policy_ok",
        value: isChecked ? "Yes" : "No",
      });
  
      console.log("Express policy attribute saved", result);
    }
}