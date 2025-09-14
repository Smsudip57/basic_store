"use client"
import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/ThemeContext';

const PaymentSuccess = () => {
    const router = useRouter();
    const context = useContext(MyContext);

    useEffect(() => {
        // Clear pending order data
        localStorage.removeItem("pendingOrderId");
        localStorage.removeItem("paymentIntentId");
        
        // Show success message
        context.setAlertBox({
            open: true,
            error: false,
            msg: "Payment successful! Your order has been confirmed."
        });

        // Redirect to orders page after a delay
        setTimeout(() => {
            router.push("/orders");
        }, 3000);
    }, []);

    return (
        <section className='section'>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-md-6 text-center'>
                        <div className='card p-5'>
                            <div className='mb-4'>
                                <div style={{ fontSize: '4rem', color: '#28a745' }}>✓</div>
                            </div>
                            <h2 className='text-success mb-3'>Payment Successful!</h2>
                            <p className='text-muted mb-4'>
                                Thank you for your purchase. Your order has been confirmed and you will receive an email confirmation shortly.
                            </p>
                            <div className='d-flex gap-3 justify-content-center'>
                                <button 
                                    className='btn btn-primary'
                                    onClick={() => router.push("/orders")}
                                >
                                    View Orders
                                </button>
                                <button 
                                    className='btn btn-outline-secondary'
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

export default PaymentSuccess;