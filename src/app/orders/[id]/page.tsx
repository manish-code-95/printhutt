import { notFound } from 'next/navigation';



import Link from 'next/link';
import { BsArrowLeft, BsCheckCircle, BsClock, BsTruck, BsXCircle } from 'react-icons/bs';
import { BiCheckCircle, BiMapPin, BiPackage, BiPhone, BiXCircle } from 'react-icons/bi';
import Order from '@/models/orderModel';
import { formatCurrency, formatDate } from '@/helpers/helpers';

const statusConfig = {
    pending: {
        icon: BsClock,
        color: 'px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800',
    },
    confirmed: {
        icon: BiCheckCircle,
        color: 'px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800',
    },
    shipped: {
        icon: BsTruck,
        color: 'px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800',
    },
    delivered: {
        icon: BiPackage,
        color: 'px-3 py-1 text-sm rounded-full bg-green-100 text-green-800',
    },
    cancelled: {
        icon: BiXCircle,
        color: 'px-3 py-1 text-sm rounded-full bg-red-100 text-red-800',
    },
};

export default async function OrderDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    const { id } = await params;
    const order = await Order.findById(id)
        .lean();

    if (!order) {
        notFound();
    }

    const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="space-y-8">
                {/* Header */}
                <div className="space-y-4">
                    <Link
                        href="/user/orders"
                        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                        <BsArrowLeft className="mr-2 h-4 w-4" />
                        Back to Orders
                    </Link>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold">Order Details</h1>
                        <div className="flex flex-col gap-1 text-muted-foreground">
                            <p>Order ID: {order.orderId}</p>
                            <p>Placed on: {formatDate(order.createdAt)}</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2 border border-gray-200 rounded-lg shadow-lg">
                    <div className="space-y-8 ">


                        {/* Order Status */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                            <div className="flex items-center gap-3">
                                <StatusIcon className="h-5 w-5" />
                                <div className={statusConfig[order.status as keyof typeof statusConfig].color}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </div>
                            </div>
                        </div>
                        {/* Order Items */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between py-4 border-b last:border-0"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium"><Link href={`/product-details/${item.slug}`} ></Link>{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-medium">{formatCurrency(item.price)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Payment Details */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Payment Method</span>
                                    <span className="capitalize">{order.payment.method}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span>Payment Status</span>
                                    <div className="flex items-center gap-2">
                                        {order.payment.isPaid ? (
                                            <>
                                                <BsCheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="text-green-500">Paid</span>
                                            </>
                                        ) : (
                                            <>
                                                <BsXCircle className="h-4 w-4 text-red-500" />
                                                <span className="text-red-500">Unpaid</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {order.payment.transactionId && (
                                    <div className="flex justify-between items-center">
                                        <span>Transaction ID</span>
                                        <span className="font-mono">{order.payment.transactionId}</span>
                                    </div>
                                )}

                                {order.payment.paidAt && (
                                    <div className="flex justify-between items-center">
                                        <span>Paid At</span>
                                        <span>{formatDate(order.payment.paidAt)}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center font-semibold">
                                        <span>Total Amount</span>
                                        <span>{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Details */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Shipping Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <BiMapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-1" />
                                    <div className="space-y-1">
                                        <p>{order.shipping.addressLine}</p>
                                        <p>
                                            {order.shipping.city}, {order.shipping.state} {order.shipping.postCode}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <BiPhone className="h-5 w-5 text-muted-foreground" />
                                    <p>{order.shipping.mobileNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}