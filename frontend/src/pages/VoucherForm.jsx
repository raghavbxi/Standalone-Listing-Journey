import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Ticket } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const voucherTypes = [
  { id: 'electronicsVoucher', label: 'Electronics Voucher', icon: '📱' },
  { id: 'fmcgVoucher', label: 'FMCG Voucher', icon: '🛒' },
  { id: 'mobilityVoucher', label: 'Mobility Voucher', icon: '🚗' },
  { id: 'officesupplyVoucher', label: 'Office Supply Voucher', icon: '📎' },
  { id: 'eeVoucher', label: 'Entertainment & Events', icon: '🎬' },
  { id: 'textileVoucher', label: 'Textile Voucher', icon: '👕' },
  { id: 'lifestyleVoucher', label: 'Lifestyle Voucher', icon: '🏠' },
  { id: 'airlineVoucher', label: 'Airline Voucher', icon: '✈️' },
  { id: 'qsrVoucher', label: 'QSR Voucher', icon: '🍔' },
  { id: 'hotelsVoucher', label: 'Hotels Voucher', icon: '🏨' },
  { id: 'otherVoucher', label: 'Other Voucher', icon: '🎁' },
];

export default function VoucherForm() {
  const navigate = useNavigate();

  const handleVoucherSelect = (voucherId) => {
    navigate(`/${voucherId}/generalinformation`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="voucher-form-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/sellerhub')}
            className="mb-4 text-gray-600 hover:text-[#C64091]"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Seller Hub
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#FCE7F3] flex items-center justify-center">
              <Ticket className="w-6 h-6 text-[#C64091]" />
            </div>
            <div>
              <h1 
                className="text-2xl font-bold text-gray-900"
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                Add Voucher
              </h1>
              <p className="text-gray-600">Select a voucher category to get started</p>
            </div>
          </div>
        </div>

        {/* Voucher Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {voucherTypes.map((voucher) => (
            <Card
              key={voucher.id}
              className="cursor-pointer hover:border-[#C64091] hover:shadow-md transition-all group"
              onClick={() => handleVoucherSelect(voucher.id)}
              data-testid={`voucher-card-${voucher.id}`}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{voucher.icon}</div>
                <p className="font-medium text-gray-900 group-hover:text-[#C64091] transition-colors text-sm">
                  {voucher.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 bg-[#FCE7F3] rounded-lg p-6">
          <h3 className="font-semibold text-[#C64091] mb-2">About Vouchers</h3>
          <p className="text-gray-600 text-sm">
            Vouchers allow you to list gift cards, discount coupons, and value-based offerings. 
            Select the appropriate category above to start creating your voucher listing.
          </p>
        </div>
      </div>
    </div>
  );
}
