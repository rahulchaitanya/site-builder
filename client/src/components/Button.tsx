type ButtonProps = {
  text: string;
  onClick?: () => void;
};

const Button = ({ text, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
    >
      {text}
    </button>
  );
};

export default Button;