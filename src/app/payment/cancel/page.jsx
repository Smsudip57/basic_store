"use client";
import React, { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { MyContext } from "@/context/ThemeContext";

const PaymentCancel = () => {
  const router = useRouter();
  const context = useContext(MyContext);

  useEffect(() => {
    // Show cancel message
    context.setAlertBox({
      open: true,
      error: true,
      msg: "Payment was cancelled. Your order has not been processed.",
    });
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="card p-5">
              <div className="mb-4">
                <div style={{ fontSize: "4rem", color: "#ffc107" }}>⚠</div>
              </div>
              <h2 className="text-warning mb-3">Payment Cancelled</h2>
              <p className="text-muted mb-4">
                Your payment was cancelled and no charges have been made. You
                can try again or contact support if you need assistance.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentCancel;
