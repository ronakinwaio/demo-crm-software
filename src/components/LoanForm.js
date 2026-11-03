"use client";

import { useState, useEffect, useCallback } from "react";

// Client-side cache for instant dropdown rendering
let cachedLoanTypesClient = null;

export default function LoanForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingLoan,
}) {
  const [loanTypes, setLoanTypes] = useState(cachedLoanTypesClient || []);
  const [loading, setLoading] = useState(!cachedLoanTypesClient);

  const fetchDropdownData = useCallback(async () => {
    if (cachedLoanTypesClient && cachedLoanTypesClient.length > 0) {
      setLoanTypes(cachedLoanTypesClient);
      setLoading(false);
      return;
    }
    try {
      const typeResponse = await fetch('/api/loan-type');
      const typeData = await typeResponse.json();
      if (typeData.success) {
        cachedLoanTypesClient = typeData.data;
        setLoanTypes(typeData.data);
      }
    } catch (error) {
      console.error('Error fetching loan types:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDropdownData();
  }, [fetchDropdownData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-slate-900 mb-5 pb-3 border-b border-gray-100">
          {editingLoan ? "Edit Loan" : "Add New Loan"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date ? formData.date.split("T")[0] : ""}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                placeholder="Enter client name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              {errors?.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile *
              </label>
              <input
                type="text"
                required
                placeholder="Enter 10-digit mobile number"
                value={formData.phone_no}
                onChange={(e) =>
                  setFormData({ ...formData, phone_no: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors?.phone_no ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors?.phone_no && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_no}</p>
              )}
            </div>

            {/* Loan Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loan Type *
              </label>
              <select
                required
                value={formData.loan_type || ""}
                onChange={(e) =>
                  setFormData({ ...formData, loan_type: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                disabled={loading}
              >
                <option value="">Select Loan Type</option>
                {loanTypes.map((type) => (
                  <option key={type.id} value={type.type_name}>
                    {type.type_name}
                  </option>
                ))}
              </select>
              {errors?.loan_type && (
                <p className="mt-1 text-sm text-red-600">{errors.loan_type}</p>
              )}
            </div>

            {/* Lander */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lander
              </label>
              <input
                type="text"
                placeholder="Enter lender / bank name"
                value={formData.lander || ""}
                onChange={(e) =>
                  setFormData({ ...formData, lander: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                placeholder="Enter loan amount"
                value={formData.loan_amount}
                onChange={(e) =>
                  setFormData({ ...formData, loan_amount: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              {errors?.loan_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.loan_amount}</p>
              )}
            </div>

            {/* Charge */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="Enter processing / commission charge"
                value={formData.charge || ""}
                onChange={(e) =>
                  setFormData({ ...formData, charge: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                * Note: This charge will automatically be added as a COMPLETED entry in Account.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/30"
            >
              {editingLoan ? "Update Loan" : "Add Loan"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
