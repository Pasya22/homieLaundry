// src/components/orders/Invoice.tsx
import React from 'react';
import { type Order } from '../../types/order';

interface InvoiceProps {
    order: Order;
}

const Invoice: React.FC<InvoiceProps> = ({ order }) => {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="thermal-invoice bg-white text-black">
            <div className="max-w-80 mx-auto p-4 thermal-content">
                {/* Header dengan Logo */}
                <div className="text-center border-b border-dashed border-gray-400 pb-3 mb-3">
                    <div className="flex justify-center items-center mb-2">
                        {/* <div className="w-12 h-12 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-lg">
                            👕
                        </div> */}
                        <img
                                src="/Logo-min-asli.png"
                                alt="Homie Laundry Logo"
                                className="w-8 h-8 object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                    </div>
                    <h1 className="text-xl font-bold uppercase tracking-tight bg-gradient-to-r from-sky-600 to-sky-800 hover:opacity-80 text-transparent bg-clip-text">HOMIE LAUNDRY</h1>
                    <p className="text-xs text-gray-600">Jalan Sukagalih I Aspol No 4</p>
                    <p className="text-xs text-gray-600">Telp: 0812-3456-7890</p>
                </div>

                {/* Info Order */}
                <div className="space-y-1 text-sm mb-3">
                    <div className="flex justify-between">
                        <span className="font-medium">No. Order:</span>
                        <span className="font-bold">{order.order_number}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Tanggal:</span>
                        <span>{formatDateTime(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="text-right">{order.customer.name}</span>
                    </div>
                    {order.customer.phone && (
                        <div className="flex justify-between">
                            <span>Telepon:</span>
                            <span>{order.customer.phone}</span>
                        </div>
                    )}
                </div>

                {/* Garis Pembatas */}
                <div className="border-t border-dashed border-gray-400 my-2"></div>

                {/* Detail Layanan */}
                <div className="mb-3">
                    <h3 className="text-sm font-bold uppercase text-center mb-2">DETAIL LAYANAN</h3>
                    <div className="space-y-2">
                        {order.order_items.map((item) => (
                            <div key={item.id} className="text-xs">
                                <div className="flex justify-between font-medium">
                                    <span>{item.service.name}</span>
                                    <span>{item.quantity}x</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span className="flex-1">{item.service.category}</span>
                                    <span className="text-right">{formatCurrency(item.unit_price)}</span>
                                </div>
                                {item.service.duration && (
                                    <div className="text-gray-500 text-xs">Durasi: {item.service.duration}</div>
                                )}
                                {item.notes && (
                                    <div className="text-blue-600 text-xs">Note: {item.notes}</div>
                                )}
                                <div className="flex justify-between font-bold border-t border-dotted border-gray-300 pt-1 mt-1">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(item.subtotal)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Garis Pembatas */}
                <div className="border-t border-dashed border-gray-400 my-2"></div>

                {/* Total Pembayaran */}
                <div className="mb-3">
                    <div className="flex justify-between text-sm font-bold">
                        <span>TOTAL:</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Status Bayar:</span>
                        <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                            {order.payment_status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span>Metode Bayar:</span>
                        <span>{order.payment_method === 'cash' ? 'TUNAI' : 'TRANSFER'}</span>
                    </div>
                </div>

                {/* Estimasi Selesai */}
                {order.estimated_completion && (
                    <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-center print-bg-gray">
                        <div className="text-xs font-bold text-yellow-700 print-text-black">ESTIMASI SELESAI</div>
                        <div className="text-sm font-bold print-text-black">{formatDateTime(order.estimated_completion)}</div>
                    </div>
                )}

                {/* Garis Pembatas */}
                <div className="border-t border-dashed border-gray-400 my-2"></div>

                {/* Syarat & Ketentuan */}
                <div className="text-xs text-gray-600 mb-3">
                    <div className="font-bold text-center mb-1">SYARAT & KETENTUAN</div>
                    <div className="space-y-1">
                        <div>1. Simpan nota ini untuk pengambilan</div>
                        <div>2. Klaim kehilangan max 24 jam setelah pengambilan</div>
                        <div>3. Barang yang tidak diambil dalam 30 hari menjadi hak milik laundry</div>
                        <div>4. Tidak menerima barang yang sobek/lusuh sebelumnya</div>
                        <div>5. Cuaca hujan dapat mempengaruhi waktu pengeringan</div>
                    </div>
                </div>

                {/* Catatan Order */}
                {order.notes && (
                    <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded print-bg-gray">
                        <div className="text-xs font-bold text-blue-700 print-text-black">CATATAN ORDER</div>
                        <div className="text-sm print-text-black">{order.notes}</div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-gray-500 border-t border-dashed border-gray-400 pt-2">
                    <div className="font-bold">TERIMA KASIH ATAS KEPERCAYAAN ANDA</div>
                    <div>*** Nota ini sah sebagai bukti pemesanan ***</div>
                </div>

                {/* Barcode Area */}
                <div className="text-center mt-3">
                    <div className="inline-block border border-dashed border-gray-400 p-2">
                        <div className="text-xs text-gray-500">[BARCODE AREA]</div>
                        <div className="text-xs font-mono">{order.order_number}</div>
                    </div>
                </div>
            </div>

            <style>{`
                /* Thermal Printer Style */
                .thermal-invoice {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    line-height: 1.2;
                }

                .thermal-content {
                    width: 80mm;
                }

                /* Print Styles */
                @media print {
                    @page {
                        margin: 0;
                        padding: 0;
                        size: 80mm auto;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        background: white;
                        font-size: 10px;
                    }

                    .thermal-invoice {
                        width: 80mm;
                        margin: 0;
                        padding: 5mm;
                        background: white;
                        font-size: 10px;
                    }

                    .thermal-content {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }

                    /* Optimasi untuk thermal printer */
                    * {
                        color: black !important;
                        background: transparent !important;
                    }

                    /* Background untuk area tertentu saat print */
                    .print-bg-gray {
                        background: #f0f0f0 !important;
                    }

                    .print-text-black {
                        color: #000 !important;
                    }

                    /* Pastikan border tetap visible */
                    .border-dashed {
                        border-style: dashed !important;
                        border-color: #666 !important;
                    }

                    .border-dotted {
                        border-style: dotted !important;
                        border-color: #666 !important;
                    }

                    .border-gray-400,
                    .border-gray-300 {
                        border-color: #666 !important;
                    }
                }

                /* Screen Styles */
                @media screen {
                    .thermal-invoice {
                        background: #f5f5f5;
                        min-height: 100vh;
                        padding: 20px 0;
                    }

                    .thermal-content {
                        background: white;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        padding: 20px;
                        margin: 0 auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default Invoice;