import { axios } from "@/lib";

const checkUsernameAvailability = async (username: string) => {
  const res = await axios.get(
    `/api/v1/auth/username-availability?username=${username}`
  );

  console.log(res);
};

export default checkUsernameAvailability;
