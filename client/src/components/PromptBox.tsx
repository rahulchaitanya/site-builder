type PromptBoxProps = {
  value: string;
  onChange: (value: string) => void;
};

const PromptBox = ({ value, onChange }: PromptBoxProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Describe your website..."
      rows={5}
      className="w-full border rounded-lg p-4 outline-none"
    />
  );
};

export default PromptBox;