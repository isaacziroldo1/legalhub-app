type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  format: (value: string) => string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
};

export function MaskedField({ label, value, onChange, format, placeholder, maxLength, required }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-zinc-700">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(format(e.target.value))}
        placeholder={placeholder}
        required={required}
        className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-orange-500"
      />
    </label>
  );
}
