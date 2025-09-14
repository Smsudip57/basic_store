"use client"
import React, { useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { MyContext } from '@/context/ThemeContext';

const PaymentFailure = () => {
    const router = useRouter();
    const context = useContext(MyContext);

    useEffect(() => {
        // Show failure message
        context.setAlertBox({
            open: true,
            error: true,
            msg: "Payment failed. Please try again or contact support."
        });
    }, []);

    return (
        <section className='section'>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-md-6 text-center'>
                        <div className='card p-5'>
                            <div className='mb-4'>
                                <div style={{ fontSize: '4rem', color: '#dc3545' }}>✗</div>
                            </div>
                            <h2 className='text-danger mb-3'>Payment Failed</h2>
                            <p className='text-muted mb-4'>
                                We couldn&apos;t process your payment. Please check your payment details 
                                and try again, or contact support if the problem persists.
                            </p>
                            <div className='d-flex gap-3 justify-content-center'>
                                <button 
                                    className='btn btn-primary'
                                    onClick={() => router.push("/checkout")}
                                >
                                    Try Again
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

export default PaymentFailure;