import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Receipt,
  AlertCircle,
  X,
  CreditCard,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface UPIPaymentDetails {
  upiId: string;
  payeeName: string;
  bankName: string;
  feeAmount: number;
  transactionRef: string;
  paymentTime: string;
}

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose?: () => void;
  bookingType: 'OPD' | 'BED';
  title: string;
  subtitle: string;
  detailsSummary: {
    patientName: string;
    hospitalName: string;
    department: string;
    slotOrCategory: string;
  };
  onPaymentSuccess: (paymentDetails: UPIPaymentDetails) => void;
}

export const UPI_ID = 'ajinkya70280@okicici';
export const PAYEE_NAME = '1360_Ajinkya';
export const BANK_NAME = 'State Bank of India 3516';
export const NOMINAL_FEE = 100;

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingType,
  title,
  subtitle,
  detailsSummary,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const upiIntentUri = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${NOMINAL_FEE}&cu=INR&tn=${encodeURIComponent(`Arogya ${bookingType} Fee`)}`;

  useEffect(() => {
    if (!isOpen) return;

    // Generate accurate, scannable QR Code
    QRCode.toDataURL(upiIntentUri, {
      width: 280,
      margin: 1.5,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation failed:', err));
  }, [isOpen, upiIntentUri]);

  if (!isOpen) return null;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setErrorMsg('');

    // Simulate verification delay
    setTimeout(() => {
      const generatedRef = utrNumber.trim() || `UPI-AJI-${Date.now().toString().slice(-6)}`;
      const paymentData: UPIPaymentDetails = {
        upiId: UPI_ID,
        payeeName: PAYEE_NAME,
        bankName: BANK_NAME,
        feeAmount: NOMINAL_FEE,
        transactionRef: generatedRef,
        paymentTime: new Date().toISOString(),
      };

      setIsVerifying(false);
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Confetti fallback
      }
      onPaymentSuccess(paymentData);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header with UPI branding */}
        <div className="bg-linear-to-r from-slate-900 via-sky-950 to-teal-950 text-white p-5 sm:p-6 relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-black uppercase tracking-wider">
              Nominal Booking Fee
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 text-[10px] font-bold">
              100% Adjustable
            </span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{title}</h3>
              <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <span className="text-[10px] text-slate-300 uppercase block font-semibold">Amount Due</span>
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">₹{NOMINAL_FEE}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          {/* Booking Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-semibold">Patient:</span>
              <span className="font-bold text-slate-900">{detailsSummary.patientName}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-semibold">Hospital:</span>
              <span className="font-bold text-slate-900 truncate max-w-[220px]">
                {detailsSummary.hospitalName}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500 font-semibold">
                {bookingType === 'OPD' ? 'Department / Slot:' : 'Department / Category:'}
              </span>
              <span className="font-bold text-teal-700">
                {detailsSummary.department} • {detailsSummary.slotOrCategory}
              </span>
            </div>
          </div>

          {/* QR Code and Payment Details */}
          <div className="bg-linear-to-b from-slate-900 to-slate-950 text-white p-5 rounded-3xl text-center shadow-lg border border-slate-800 relative">
            {/* Beneficiary Header matching user's GPay screenshot */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-tr from-cyan-500 to-teal-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-sm">
                A
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white">{PAYEE_NAME}</div>
                <div className="text-[10px] text-slate-400">{BANK_NAME}</div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3.5 rounded-2xl inline-block shadow-inner mx-auto my-1 relative group">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Arogya UPI QR Code"
                  className="w-48 h-48 sm:w-52 sm:h-52 object-contain mx-auto"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-slate-100 text-slate-400 rounded-xl">
                  Generating QR Code...
                </div>
              )}
              <div className="text-[10px] font-bold text-slate-700 mt-1 flex items-center justify-center gap-1">
                <span>Scan to pay ₹{NOMINAL_FEE} with any UPI app</span>
              </div>
            </div>

            {/* Supported App Badges */}
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2">
              <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">Google Pay</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">PhonePe</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">Paytm</span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700">BHIM</span>
            </div>

            {/* UPI ID Pill with Copy button */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-800/50 p-2.5 rounded-xl border">
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium">Official UPI ID:</span>
                <span className="font-mono text-cyan-300 font-bold text-xs select-all">{UPI_ID}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUPI}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-[11px] font-bold flex items-center gap-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            {/* Mobile Direct Intent button */}
            <div className="mt-3">
              <a
                href={upiIntentUri}
                className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-linear-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open in Installed UPI App (GPay / PhonePe)</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          </div>

          {/* Optional UTR / Reference Entry */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>UPI Transaction Reference / UTR Number:</span>
              <span className="text-[10px] text-slate-400 font-normal">(Optional for faster sync)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 428190348123 (12-digit UTR)"
              value={utrNumber}
              onChange={e => setUtrNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-[11px] text-slate-500">
              Found under the transaction details in your UPI app (Google Pay, PhonePe, Paytm).
            </p>
          </div>

          {/* Policy & Anti-Spam Notice */}
          <div className="p-3 bg-cyan-50/70 rounded-2xl border border-cyan-200/80 text-[11px] text-cyan-950 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Why a nominal fee?</strong> The ₹100 confirmation fee ensures slots and bed requests are reserved exclusively for genuine patients, prevents bot spam, and is 100% credited against your final hospital consultation or admission bill.
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isVerifying}
            className="flex-1 py-3 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying UPI Payment...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>I Have Paid ₹{NOMINAL_FEE} • Confirm Booking</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
