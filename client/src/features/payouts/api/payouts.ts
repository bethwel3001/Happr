import { axios } from "@/lib";

interface VerifyAccountParams {
  bank_code: string;
  account_number: string;
}

interface VerifyAccountResponse {
  success: boolean;
  message: string;
  data: {
    account_name: string;
  };
}

export const verifyAccountDetails = async ({
  bank_code,
  account_number,
}: VerifyAccountParams): Promise<{
  success: boolean;
  message: string;
  account_name?: string;
}> => {
  try {
    const response = await axios.post<VerifyAccountResponse>(
      "/api/v1/payouts/account-name-resolver",
      { bankCode: bank_code, accountNumber: account_number },
    );
    console.log(response);

    return {
      success: response.success,
      message: response.message,
      account_name: response.data.account_name,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
};

export const sendOtp = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post<{ success: boolean; message: string }>(
      "/api/v1/user/generate-otp",
      { email },
    );

    return {
      success: response.success,
      message: response.message,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Something went wrong");
    }
  }
};
