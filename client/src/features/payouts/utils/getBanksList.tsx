import { axios } from "@/lib";
import type { Bank, PaystackBank } from "../types";

const getBanksList = async (): Promise<Bank[]> => {
  const res = await axios.get<{
    success: boolean;
    message: string;
    data: PaystackBank[];
  }>("/api/v1/payouts/get-banks-list");

  const banks: Bank[] = res.data
    .filter((bank) => bank.active)
    .map((bank) => ({
      id: bank.id,
      name: bank.name,
      code: bank.code,
      longcode: bank.longcode,
    }));

  return banks;
};

export default getBanksList;
