
import { axios } from "@/lib";
import { isAxiosError } from "axios";
import type { InitializeDonationPayload, InitializeDonationResponse } from "../types";

const initializeDonation = async (
    payload: InitializeDonationPayload
): Promise<InitializeDonationResponse> => {
    try {
        const response = await axios.post<InitializeDonationResponse>(
            "/api/v1/payment/initialize",
            payload
        );
        return response;
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            throw new Error(
                err.response?.data?.message || "Failed to initialize donation"
            );
        }
        throw new Error("An unexpected error occurred");
    }
};

export default initializeDonation;
