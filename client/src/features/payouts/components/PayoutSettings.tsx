import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import BanksDropDown from "./BanksDropDown";
import { verifyAccountDetails, sendOtp } from "../api/payouts";
import type { Bank } from "../types";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const PayoutSettings = () => {
  const { user } = useAuth();
  const [selectedBank, setSelectedBank] = useState<Bank | undefined>(
    user?.bank_account
      ? ({
          id: user.bank_account.bank_id || 0,
          name: user.bank_account.bank_name || "",
          code: user.bank_account.bank_code || "",
          longcode: user.bank_account.longcode || "",
        } as Bank)
      : undefined,
  );

  const [accountNo, setAccountNo] = useState<number | undefined>(
    user?.bank_account?.account_number
      ? Number(user.bank_account.account_number)
      : undefined,
  );
  const [accountName, setAccountName] = useState<string>(
    user?.bank_account?.account_name || "",
  );
  const [isDetailsVerified, setIsDetailsVerified] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [otp, setOtp] = useState<string>("");

  const handleVerifyDetails = async () => {
    if (!selectedBank || !accountNo) {
      toast.error("Please select a bank and enter account number");
      return;
    }

    try {
      const result = await verifyAccountDetails({
        bank_code: selectedBank.code,
        account_number: accountNo.toString(),
      });

      if (result.success) {
        setAccountName(result.account_name || "");
        setIsDetailsVerified(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed. Try again.");
    }
  };

  const handleSendOtp = async () => {
    if (!user?.email) return;
    try {
      const response = await sendOtp(user.email);
      if (response.success) {
        toast.success("OTP sent successfully");
        setIsOTPSent(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to send OTP");
    }
  };

  const handleSubmit = async () => {
    if (isOTPVerified) {
      setIsDetailsVerified(false);
      setIsOTPSent(false);
      setIsOTPVerified(false);
      setOtp("");
      toast.success("Payout details updated successfully");
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <h2 className="text-xl"> Bank Information </h2>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="w-full flex flex-col gap-4 p-4 border rounded-md mb-8"
      >
        <div className="w-full flex flex-col gap-2">
          <span> Bank Name </span>
          <BanksDropDown
            selected={selectedBank}
            setSelected={setSelectedBank}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label htmlFor="account-number"> Account Number </label>
          <Input
            type="number"
            id="account-number"
            value={accountNo || ""}
            onChange={(e) => setAccountNo(Number(e.target.value))}
          />
        </div>

        {isDetailsVerified && (
          <div className="w-full flex flex-col gap-2 capitalize p-4 bg-green-100 border border-green-300 rounded-md mb-4">
            <h4 className="font-bold text-lg"> Account Holder: </h4>
            {accountName}
            {isOTPSent && (
              <Input
                type="number"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            )}
          </div>
        )}

        {!isDetailsVerified ? (
          <Button onClick={handleVerifyDetails}>Verify Details</Button>
        ) : !isOTPSent ? (
          <Button onClick={handleSendOtp}>Send OTP</Button>
        ) : (
          <Button onClick={handleSubmit}>Save Changes</Button>
        )}
      </form>

      <h2 className="text-xl"> Security Notice </h2>
      <ul className="ml-8 [&_li]:list-disc [&_li]:mb-1">
        <li> OTP is required to change payout info. </li>
        <li> Your bank details are well encrypted. </li>
        <li>
          Last updated on: <strong>Oct 22, 2025.</strong>
        </li>
      </ul>
    </div>
  );
};

export default PayoutSettings;
