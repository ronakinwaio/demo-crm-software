"use client";

import { useState, useEffect } from "react";
import React from "react";
import { toast } from "react-toastify";
import LoanForm from "../../../components/LoanForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function LoanPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    name: "",
    phone_no: "",
    loan_type: "",
    lander: "",
    loan_amount: "",
    charge: "",
  });

  const [errors, setErrors] = useState({});

  const fetchLoans = async () => {
    try {
      const response = await fetch("/api/loans", { cache: "no-store" });
      const data = await response.json();
      if (data.success) {
        setLoans(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLoans();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone_no)) {
      newErrors.phone_no = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.loan_type) {
      newErrors.loan_type = "Loan type is required";
    }

    if (!formData.loan_amount || parseFloat(formData.loan_amount) <= 0) {
      newErrors.loan_amount = "Valid loan amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formData.date || new Date().toISOString().split("T")[0],
          name: formData.name.trim(),
          phone_no: formData.phone_no.trim(),
          loan_type: formData.loan_type,
          lander: (formData.lander || "").trim(),
          loan_amount: formData.loan_amount,
          charge: formData.charge || "0",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Loan added successfully!");
        resetForm();
        fetchLoans();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      name: "",
      phone_no: "",
      loan_type: "",
      lander: "",
      loan_amount: "",
      charge: "",
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredLoans = loans
    .filter((loan) => {
      if (!startDate && !endDate) return true;
      const dateValue = loan.date || loan.created_at || "";
      if (!dateValue) return false;
      const entryDate = dateValue.split("T")[0];
      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;
      return true;
    })
    .filter((loan) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();

      if (loan.number_series && loan.number_series.toString().toLowerCase().includes(query)) return true;
      if (loan.name && loan.name.toLowerCase().includes(query)) return true;
      if (loan.phone_no && loan.phone_no.toLowerCase().includes(query)) return true;
      if (loan.loan_type && loan.loan_type.toLowerCase().includes(query)) return true;
      if (loan.lander && loan.lander.toLowerCase().includes(query)) return true;
      if (loan.bank_name && loan.bank_name.toLowerCase().includes(query)) return true;

      return false;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="sm:flex block justify-between items-center mb-6">
        {/* Date and Search Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 flex-wrap">
            {/* Search Input */}
            <div className="flex flex-col">
              <input
                type="text"
                placeholder="Search by No., Name, Phone, Lander..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 h-9 w-72 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-0 h-9 w-36 text-sm text-gray-700"
              />
            </div>

            <div className="flex flex-col">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-0 h-9 w-36 text-sm text-gray-700"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setSearchQuery("");
                }}
                className="ml-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 text-xs font-semibold transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-5 py-2.5 sm:mt-0 mt-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02]"
        >
          Add New Loan
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <LoanForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingLoan={null}
        />
      )}

      {/* Loans Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  No.
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Mobile
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Loan Type
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Lander
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Charge
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No loans found. Click &quot;Add New Loan&quot; to get started.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan, index) => {
                  const rowBgClass = index % 2 === 0 ? "bg-slate-50/50" : "bg-white hover:bg-blue-50/40";
                  const landerName = loan.lander || loan.bank_name || "-";
                  const chargeVal = parseFloat(loan.charge || 0);

                  return (
                    <tr key={loan.id} className={`transition-colors ${rowBgClass}`}>
                      <td className="px-4 py-3 text-sm font-bold text-blue-950">
                        {loan.number_series || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(loan.date || loan.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {formatDisplayText(loan.name, "-")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <a
                          href={`tel:${loan.phone_no}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {loan.phone_no || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {loan.loan_type || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDisplayText(landerName, "-")}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-900">
                        ₹{parseFloat(loan.loan_amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-emerald-700">
                        {chargeVal > 0 ? `₹${chargeVal.toLocaleString("en-IN")}` : "₹0"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
