import { useRouter } from "next/navigation";
import { useCallback } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  adId: string;
  amount: number; // in ₹
  email: string;
  name?: string;
  description?: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/** Dynamically loads the Razorpay checkout script */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Encapsulates the full Razorpay payment flow:
 *  1. Load the Razorpay JS SDK
 *  2. POST /api/payment/create-order   → get rzp orderId
 *  3. Open Razorpay checkout popup
 *  4. On success → POST /api/payment/verify  → update ad status
 *  5. Send confirmation email via /api/ads/confirm
 */
export function useRazorpay() {
  const router = useRouter();

  const initiatePayment = useCallback(
    async ({
      adId,
      amount,
      email,
      name = "Customer",
      description = "Advertisement Booking",
      onSuccess,
      onError,
    }: RazorpayOptions) => {
      // 1. Load SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        onError("Failed to load payment gateway. Please try again.");
        return;
      }

      // 2. Create order on server
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adId }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        onError(err.error || "Failed to initiate payment.");
        return;
      }

      const { orderId, amount: rzpAmount, currency } = await orderRes.json();

      // 3. Open checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpAmount,
        currency,
        name: "The Shillong Times",
        description,
        order_id: orderId,
        prefill: {
          name,
          email,
        },
        theme: {
          color: "#249cff",
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          // 4. Verify signature on server
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              adId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyRes.ok) {
            onError("Payment verification failed. Please contact support.");
            return;
          }

          // 5. Send confirmation email
          try {
            await fetch("/api/ads/confirm", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ adId }),
            });
          } catch {
            // Email failure should not block the success flow
          }

          onSuccess();
        },
        modal: {
          ondismiss: () => {
            onError("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        onError(
          response.error?.description || "Payment failed. Please try again."
        );
      });
      rzp.open();
    },
    [router]
  );

  return { initiatePayment };
}
