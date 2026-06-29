import {useEffect, useRef, useState} from "preact/hooks";

function setHpAction(action) {
  globalThis.hpCheckoutAction = action;

  setTimeout(() => {
    if (globalThis.hpCheckoutAction === action) {
      globalThis.hpCheckoutAction = "";
    }
  }, 800);
}

export function SignatureRequired() {
  const [showError, setShowError] = useState(false);
  const [signatureChoice, setSignatureChoice] = useState("");

  const acceptedRef = useRef(false);
  const checkoutReadyRef = useRef(false);

  const totalAmount = Number(shopify.cost.totalAmount.current.amount) || 0;
  const requiresSignature = totalAmount >= 200;

  useEffect(() => {
    const timer = setTimeout(() => {
      checkoutReadyRef.current = true;
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!requiresSignature) {
      acceptedRef.current = false;
      setShowError(false);
      setSignatureChoice("");
    }
  }, [requiresSignature]);

    useEffect(() => {
      const unsubscribe = shopify.buyerJourney.intercept(({canBlockProgress}) => {
        if (!requiresSignature) {
          setShowError(false);
          return {behavior: "allow"};
        }

        // prevent validation on checkout page load
        if (!checkoutReadyRef.current) {
          setShowError(false);
          return {behavior: "allow"};
        }

        if (!acceptedRef.current && canBlockProgress) {

          if (globalThis.hpCheckoutAction === "express" || globalThis.hpCheckoutAction === "international") {
            return {behavior: "allow"};
          }

          setShowError(true);

          return {
            behavior: "block",
            reason: "Signature option required",
          };
        }

        return {behavior: "allow"};
      });

      return unsubscribe;
    }, [requiresSignature]);

  if (!requiresSignature) return null;

  return (
    <s-box padding="base">
      <s-banner
        heading="Signature Required"
        tone={showError ? "critical" : "info"}
      >
        <s-stack gap="base">
          <s-text>
            Orders over $200 require a signature option before placing the order.
          </s-text>

          {signatureChoice && (
            <s-text>
              Selected option:{" "}
              {signatureChoice === "require"
                ? "Require Signature"
                : "Waive Signature"}
            </s-text>
          )}

          {showError && (
            <s-text tone="critical">
              Please select a signature option before placing your order.
            </s-text>
          )}

          <s-box maxInlineSize="240px">
            <s-button
              variant="secondary"
              command="--show"
              commandFor="signature-modal"
            >
              {signatureChoice ? "Update signature option" : "Signature options"}
            </s-button>
          </s-box>
        </s-stack>
      </s-banner>

      <s-modal id="signature-modal" heading="Signature required for this delivery">
        <s-stack gap="base">
          <s-text>
            Your order total is over $200, so please select a signature option.
          </s-text>

          <s-stack gap="base">
            <s-grid gridTemplateColumns="auto 1fr" gap="base" alignItems="start">
              <s-checkbox
                checked={signatureChoice === "require"}
                onChange={() => onSignatureSelect("require")}
                onInput={() => onSignatureSelect("require")}
              />
              <s-text>
                Require signature — I’ll be available to sign for this delivery.
              </s-text>
            </s-grid>

            <s-grid gridTemplateColumns="auto 1fr" gap="base" alignItems="start">
              <s-checkbox
                checked={signatureChoice === "waive"}
                onChange={() => onSignatureSelect("waive")}
                onInput={() => onSignatureSelect("waive")}
              />
              <s-text>
                Waive signature — I accept full responsibility if this package is
                lost, stolen, or goes missing after delivery.
              </s-text>
            </s-grid>
          </s-stack>

          <s-button
            variant="primary"
            onClick={onContinue}
            command="--hide"
            commandFor="signature-modal"
          >
            Continue
          </s-button>
        </s-stack>
      </s-modal>
    </s-box>
  );

  async function onSignatureSelect(value) {

    setHpAction("signature");
    setSignatureChoice(value);
    acceptedRef.current = true;
    setShowError(false);

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "signature_option",
      value: value === "require" ? "Require Signature" : "Waive Signature",
    });

    await shopify.applyAttributeChange({
      type: "updateAttribute",
      key: "sign_req_ok",
      value: "Yes",
    });
  }

  async function onContinue() {
    if (!signatureChoice) {
      setShowError(true);
      return;
    }

    acceptedRef.current = true;
    setShowError(false);
  }
}