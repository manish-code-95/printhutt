import { formatDate, shiprocketAuth } from '@/helpers/helpers';
import { sendOrderStatus } from '@/lib/mail/mailer';
import Order from '@/models/orderModel';
import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { orderId, shipmentDetails } = await request.json();

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            );
        }

        const token = await shiprocketAuth();

        const payload = JSON.stringify({
            order_id: order.orderId,
            order_date: order.createdAt,
            pickup_location: "Primary",
            billing_customer_name: order.shipping.userName,
            billing_last_name: "",
            billing_address: order.shipping.addressLine,
            billing_address_2: "",
            billing_city: order.shipping.city,
            billing_pincode: order.shipping.postCode,
            billing_state: order.shipping.state,
            billing_country: "India",
            billing_email: order.shipping.email || "",
            billing_phone: order.shipping.mobileNumber,
            shipping_is_billing: true,
            order_items: order.items.map(item => ({
                name: item.name,
                sku: item.sku || 'SKU' + item.productId,
                units: item.quantity,
                selling_price: item.price,
                discount: 0,
                tax: 0,
                hsn: 441122,
            })),
            payment_method: order.paymentType == 'online' ? 'online' : 'cash on delivery',
            shipping_charges: 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: 0,
            sub_total: order.totalAmount,
            length: shipmentDetails.length,
            breadth: shipmentDetails.width,
            height: shipmentDetails.height,
            weight: shipmentDetails.weight,
        });




        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            data: payload
        };

        const shiprocketResponse = await axios(config)
        const shipmentData = shiprocketResponse.data;

        order.status = 'shipped'
        order.shipment = {
            provider: 'shiprocket',
            trackingId: shipmentData.shipment_id,
            order_id: shipmentData.order_id,
            ...shipmentDetails,
        };

        await sendOrderStatus(order)


        await order.save();



        return NextResponse.json(shipmentData);
    } catch (error) {
        if (error.response && error.response.status === 422) {
            console.error('Validation error:', error.response.data);
            return NextResponse.json(
                { error: 'Validation error', details: error.response.data },
                { status: 422 }
            );
        }
        console.error('Error creating shipment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}