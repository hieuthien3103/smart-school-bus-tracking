interface FormField {
  name: string;
  type: 'text' | 'time' | 'number' | 'select';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string | number;
}

interface FormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  submitLabel?: string;
  isEditing?: boolean;
}

const Form = ({ 
  fields, 
  onSubmit, 
  onCancel, 
  submitLabel = 'Thêm mới',
  isEditing = false 
}: FormProps) => {
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Form Fields - Scrollable */}
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  defaultValue={field.defaultValue as string}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={field.placeholder}
                  required={field.required}
                >
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  defaultValue={field.defaultValue}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={field.required}
                />
              )}
            </div>
          ))}
        </div>

        {/* Fixed Buttons */}
        <div className="flex space-x-3 pt-6 mt-4 border-t border-gray-200 bg-white">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditing ? 'Cập nhật' : submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;