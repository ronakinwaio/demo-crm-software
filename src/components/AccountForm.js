"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AccountForm({
  formData,
  setFormData,
  errors,
  onSubmit,
  onCancel,
  editingAccount,
}) {
  const [searching, setSearching] = useState(false);
  const [seriesNumber, setSeriesNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const statusOptions = ["COMPLETE", "RECEIPT", "PAYMENT"];
  const paymentTypeOptions = ["CASH", "ONLINE"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    if (formData.number_series) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeriesNumber(formData.number_series);
    }
  }, [formData.number_series]);

  const handleSeriesSearch = async () => {
    if (!seriesNumber.trim()) {
      toast.warning("Please enter a series number");
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/search-series?series=${seriesNumber.trim().toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          number_series: seriesNumber.trim().toUpperCase(),
          name: data.data.name || prev.name,
          phone_no: data.data.phone_no || prev.phone_no,
        }));
        toast.success("Details auto-filled from series number!");
      } else {
        toast.error(data.message || "Series number not found");
      }
    } catch (error) {
      toast.error("Error searching series number");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-5 flex-wrap gap-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-900">
            {editingAccount ? "Edit Account Record" : "Add New Account Record"}
          </h2>

          {!editingAccount && (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Series No (e.g. L-1)"
                value={seriesNumber}
                onChange={(e) => setSeriesNumber(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-black uppercase"
              />
              <button
                type="button"
                onClick={handleSeriesSearch}
                disabled={searching}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-colors disabled:opacity-50"
              >
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          )}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Series Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Series No
              </label>
              <input
                type="text"
                name="number_series"
                value={formData.number_series || ""}
                onChange={handleChange}
                placeholder="e.g. L-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date_time ? formData.date_time.split("T")[0] : ""}
                onChange={handleChange}
                name="date_time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
              {errors?.date_time && <p className="text-red-500 text-xs mt-1">{errors.date_time}</p>}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name || ""}
                onChange={handleChange}
                name="name"
                placeholder="Enter client name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors?.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors?.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Phone No */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone No *
              </label>
              <input
                type="text"
                required
                value={formData.phone_no || ""}
                onChange={handleChange}
                name="phone_no"
                placeholder="Enter phone number"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors?.phone_no ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors?.phone_no && <p className="text-red-500 text-xs mt-1">{errors.phone_no}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status || "COMPLETE"}
                onChange={handleChange}
                name="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Type
              </label>
              <select
                value={formData.payment_type || "CASH"}
                onChange={handleChange}
                name="payment_type"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              >
                {paymentTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.complete_amount || ""}
                onChange={handleChange}
                name="complete_amount"
                placeholder="Enter amount"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors?.complete_amount ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors?.complete_amount && (
                <p className="text-red-500 text-xs mt-1">{errors.complete_amount}</p>
              )}
            </div>

            {/* Note */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.note || ""}
                onChange={handleChange}
                name="note"
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Enter note or details"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-xl hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/30"
            >
              {editingAccount ? "Update Account" : "Add Account"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
