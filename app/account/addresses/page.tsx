import { getUserAddresses } from "@/lib/data/addresses";
import { AddressList } from "@/components/account/address-components";

export default async function AddressesPage() {
  const { addresses, error } = await getUserAddresses();

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        {error}
      </div>
    );
  }

  return <AddressList addresses={addresses} />;
}
