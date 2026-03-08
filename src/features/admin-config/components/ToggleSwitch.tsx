type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function ToggleSwitch({ checked, onChange, disabled }: Props) {
  return (
    <label className="config-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className="config-toggle-slider" />
    </label>
  );
}
