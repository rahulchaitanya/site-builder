type PricingCardProps = {
  plan: string;
  price: string;
  credits: string;
};

const PricingCard = ({ plan, price, credits }: PricingCardProps) => {
  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-lg transition">
      <h2 className="text-xl font-bold">
        {plan}
      </h2>

      <p className="text-3xl font-bold mt-3">
        {price}
      </p>

      <p className="text-gray-500 mt-2">
        {credits}
      </p>
    </div>
  );
};

export default PricingCard;