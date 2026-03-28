const InputField = ({
	label,
	name,
	value,
	onChange,
	error,
	success,
	placeholder,
	type = "number",
	disabled = false,
}) => {
	return (
		<div className="flex flex-col gap-1.5 w-full">
			<div className="flex justify-between items-center">
				<label htmlFor={name} className="text-sm font-medium text-gray-400">
					{label}
				</label>
				{success && (
					<span className="text-xs text-emerald-500 font-medium">
						{success}
					</span>
				)}
			</div>
			<input
				type={type}
				id={name}
				name={name}
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				step={type === "number" ? "any" : undefined}
				disabled={disabled}
				className={`w-full bg-black border ${
					error
						? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
						: success
							? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
							: "border-gray-800 focus:border-gray-500 focus:ring-gray-500/20"
				} rounded-lg px-4 py-2.5 text-sm outline-none transition-all placeholder:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
			/>
			{error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
		</div>
	);
};

export default InputField;
