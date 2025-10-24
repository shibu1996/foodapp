'use client';

import { Address } from '../../context/SubscriptionContext';

interface SavedAddressListProps {
  addresses: Address[];
  selectedId?: string;
  onSelect: (address: Address) => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export function SavedAddressList({
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onAddNew
}: SavedAddressListProps) {
  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No saved addresses yet</p>
        <button
          onClick={onAddNew}
          className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark"
        >
          Add Your First Address
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Saved Addresses</h3>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg font-medium hover:bg-teal-200"
        >
          + Add New Address
        </button>
      </div>

      {addresses.map((address) => {
        const isSelected = address.id === selectedId;
        const fullAddress = `${address.houseNo}, ${address.street}, ${address.area}, ${address.city}, ${address.state} - ${address.pincode}`;

        return (
          <button
            key={address.id}
            onClick={() => onSelect(address)}
            className={`w-full p-5 rounded-xl border-2 transition text-left ${
              isSelected
                ? 'border-primary bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Radio Button */}
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                isSelected
                  ? 'border-primary bg-primary'
                  : 'border-gray-300'
              }`}>
                {isSelected && (
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                )}
              </div>

              {/* Address Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    {address.label || 'Other'}
                  </span>
                  {address.isDefault && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-gray-800 font-medium mb-1">{fullAddress}</p>
                
                {address.landmark && (
                  <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this address?')) {
                          onDelete(address.id!);
                        }
                      }}
                      className="text-sm text-red-600 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}


