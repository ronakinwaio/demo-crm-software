"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import AccountForm from "../../../components/AccountForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function AccountPage() {
  const [accountRecords, setAccountRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    number_series: "",
    name: "",
    phone_no: "",
    status: "COMPLETE",
    date_time: new Date().toISOString().split("T")[0],
    payment_type: "CASH",
    complete_amount: "",
    note: "",
  });

  const [errors, setErrors] = useState({});

  const formatDisplayDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchAccountRecords = async () => {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      const data = await response.json();
      if (data.success) {
        setAccountRecords(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch Account records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAccountRecords();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || !formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.phone_no || !formData.phone_no.trim()) newErrors.phone_no = "Phone number is required";
    if (!formData.date_time) newErrors.date_time = "Date is required";
    if (formData.complete_amount === "" || parseFloat(formData.complete_amount) < 0) {
      newErrors.complete_amount = "Valid amount is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const url = "/api/account";
      const method = editingAccount ? "PUT" : "POST";

      const payload = {
        ...(editingAccount ? { id: editingAccount.id } : {}),
        number_series: (formData.number_series || "").trim(),
        name: formData.name.trim(),
        phone_no: formData.phone_no.trim(),
        status: formData.status || "COMPLETE",
        date_time: formData.date_time || new Date().toISOString().split("T")[0],
        payment_type: formData.payment_type || "CASH",
        complete_amount: formData.complete_amount,
        note: (formData.note || "").trim(),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          editingAccount
            ? "Account record updated successfully!"
            : "Account record added successfully!"
        );
        resetForm();
        fetchAccountRecords();
        setShowForm(false);
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      number_series: account.number_series || "",
      name: account.name || "",
      phone_no: account.phone_no || "",
      status: account.status || "COMPLETE",
      date_time: account.date_time ? account.date_time.split("T")[0] : new Date().toISOString().split("T")[0],
      payment_type: account.payment_type || "CASH",
      complete_amount: account.complete_amount !== undefined ? account.complete_amount : (account.amount || ""),
      note: account.note || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this Account record?")) return;

    try {
      const response = await fetch(`/api/account?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Account record deleted successfully!");
        fetchAccountRecords();
      } else {
        toast.error(data.message || "Failed to delete Account record");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const resetForm = () => {
    setFormData({
      number_series: "",
      name: "",
      phone_no: "",
      status: "COMPLETE",
      date_time: new Date().toISOString().split("T")[0],
      payment_type: "CASH",
      complete_amount: "",
      note: "",
    });
    setErrors({});
    setEditingAccount(null);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const filteredAccounts = useMemo(() => {
    return accountRecords.filter((account) => {
      if (statusFilter !== "ALL") {
        if (String(account.status || "").toUpperCase() !== statusFilter) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          (account.number_series && account.number_series.toString().toLowerCase().includes(query)) ||
          (account.name && account.name.toLowerCase().includes(query)) ||
          (account.phone_no && account.phone_no.toLowerCase().includes(query)) ||
          (account.note && account.note.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [accountRecords, statusFilter, searchQuery]);

  const totalAmount = useMemo(() => {
    return filteredAccounts.reduce(
      (sum, acc) => sum + parseFloat(acc.complete_amount || acc.amount || 0),
      0
    );
  }, [filteredAccounts]);

  const exportToExcel = () => {
    const dataToExport = filteredAccounts.map((account) => ({
      "Series Number": account.number_series || "-",
      "Date": account.date_time ? new Date(account.date_time).toLocaleDateString("en-IN") : "-",
      "Name": account.name || "-",
      "Phone": account.phone_no || "-",
      "Status": account.status || "-",
      "Amount": parseFloat(account.complete_amount || account.amount || 0),
      "Note": account.note || "-",
    }));

    if (dataToExport.length === 0) {
      toast.warning("No records to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Accounts");
    XLSX.writeFile(
      workbook,
      `Account_Records_${statusFilter}_${new Date().toLocaleDateString("en-IN").replace(/\//g, "-")}.xlsx`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header Bar */}
      <div className="flex justify-between flex-wrap items-center mb-6 gap-3">
        <div className="flex gap-2 flex-wrap items-center">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === "ALL"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("RECEIPT")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === "RECEIPT"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Receipt
          </button>
          <button
            onClick={() => setStatusFilter("COMPLETE")}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${statusFilter === "COMPLETE"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            Complete
          </button>

          <div className="py-1 flex items-center ml-2">
            <input
              type="text"
              placeholder="Search by No., Name, Phone, or Note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 h-9 w-72 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={exportToExcel}
            className="px-4 py-2 ml-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-sm"
          >
            Export to Excel
          </button>

          <div className="bg-blue-50 border border-blue-200 flex flex-col items-center justify-center rounded-lg p-1.5 px-4 shadow-sm">
            {/* <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Total Amount</span> */}
            <p className="text-xl font-bold text-blue-700">
              ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02]"
        >
          Add
        </button>
      </div>

      {/* Account Records Table */}
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
                  Phone
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Amount
                </th>
                {/* <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Note
                </th> */}
                <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No account records found. Click &quot;Add&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account, index) => {
                  const rowBgClass = index % 2 === 0 ? "bg-slate-50/50" : "bg-white hover:bg-blue-50/40";
                  const amountNum = parseFloat(account.complete_amount || account.amount || 0);

                  return (
                    <tr key={account.id} className={`transition-colors ${rowBgClass}`}>
                      <td className="px-4 py-3 text-sm font-bold text-blue-950">
                        {account.number_series || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDisplayDate(account.date_time || account.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {formatDisplayText(account.name, "-")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <a
                          href={`tel:${account.phone_no}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {account.phone_no || "-"}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${account.status === "PAYMENT"
                            ? "bg-amber-100 text-amber-800"
                            : account.status === "RECEIPT"
                              ? "bg-sky-100 text-sky-800"
                              : account.status === "COMPLETE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                        >
                          {account.status || "COMPLETE"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-900">
                        ₹{amountNum.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      {/* <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={account.note || ""}>
                        {account.note || "-"}
                      </td> */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(account)}
                            className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 font-semibold transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 font-semibold transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <AccountForm
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          editingAccount={editingAccount}
        />
      )}
    </div>
  );
}
