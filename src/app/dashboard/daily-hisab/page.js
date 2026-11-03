"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import HisabForm from "../../../components/HisabForm";

export default function DailyHisabPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/daily-hisab", { cache: "no-store" });
      const data = await response.json();
      if (data.success) {
        setEntries(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, []);

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch("/api/daily-hisab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Entry added successfully!");
        fetchEntries();
        setShowForm(false);
      } else {
        toast.error(data.message || "Failed to add entry");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    try {
      const response = await fetch(`/api/daily-hisab/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Entry deleted successfully!");
        fetchEntries();
      } else {
        toast.error(data.message || "Failed to delete entry");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const filteredEntries = entries.filter((e) => {
    const entryDate = (e.date || e.entry_date || e.created_at || '').split('T')[0];
    if (!entryDate) return false;
    return (!startDate || entryDate >= startDate) && (!endDate || entryDate <= endDate);
  });

  // Calculate Totals based on filtered entries
  const totalIncome = filteredEntries
    .filter((e) => e.type === "INCOME")
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const totalExpense = filteredEntries
    .filter((e) => e.type === "EXPENSE")
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);

  const balance = totalIncome - totalExpense;

  const exportToExcel = () => {
    const dataToExport = filteredEntries.map(entry => ({
      "Date": entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : "-",
      "Description": entry.description || "-",
      "Type": entry.type || "-",
      "Amount": parseFloat(entry.amount) || 0,
    }));

    if (dataToExport.length === 0) {
      toast.warning("No records to export for this date range!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily_Hisab");

    const maxWidths = dataToExport.map(row => Object.values(row).map(val => val.toString().length));
    const colWidths = maxWidths[0].map((_, i) => Math.max(...maxWidths.map(row => row[i])));
    worksheet['!cols'] = colWidths.map(w => ({ wch: w + 2 }));

    XLSX.writeFile(workbook, `Daily_Hisab_${startDate}_to_${endDate}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {/* Date Range Filter Card */}
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-b-4 border-blue-600">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Start Date</p>
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-base font-bold text-slate-900 focus:outline-none cursor-pointer w-full bg-transparent"
            />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-b-4 border-blue-600">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">End Date</p>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-base font-bold text-slate-900 focus:outline-none cursor-pointer w-full bg-transparent"
          />
        </div>

        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-b-4 border-emerald-500">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Income</p>
          <p className="text-xl font-extrabold text-emerald-600">₹{totalIncome.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-white p-3.5 rounded-2xl shadow-sm border-b-4 border-red-500">
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Expense</p>
          <p className="text-xl font-extrabold text-red-600">₹{totalExpense.toLocaleString('en-IN')}</p>
        </div>
        <div className={`bg-white p-3.5 rounded-2xl shadow-sm border-b-4 ${balance >= 0 ? 'border-blue-600' : 'border-amber-500'}`}>
          <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Balance</p>
          <p className={`text-xl font-extrabold ${balance >= 0 ? 'text-blue-900' : 'text-amber-600'}`}>
            ₹{balance.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
        <div className="flex gap-2.5">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-sm transition-all flex items-center gap-2 text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 text-xs hover:scale-[1.02]"
          >
            <span>+</span> Add Entry
          </button>
        </div>
      </div>

      {/* Entry Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Column */}
        <div>
          <h3 className="text-xs font-bold text-emerald-600 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Income List
          </h3>
          <div className="space-y-2.5">
            {filteredEntries.filter(e => e.type === "INCOME").length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-semibold">
                No Income Found
              </div>
            ) : (
              filteredEntries.filter(e => e.type === "INCOME").map((entry) => (
                <div key={entry.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3.5 flex items-center justify-between border border-gray-100 border-l-4 border-l-emerald-500">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{entry.description}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-extrabold text-emerald-600 whitespace-nowrap">
                      + ₹{parseFloat(entry.amount).toLocaleString('en-IN')}
                    </p>
                    <button onClick={() => handleDelete(entry.id)} className="p-1 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Expense Column */}
        <div>
          <h3 className="text-xs font-bold text-red-600 uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Expense List
          </h3>
          <div className="space-y-2.5">
            {filteredEntries.filter(e => e.type === "EXPENSE").length === 0 ? (
              <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs font-semibold">
                No Expenses Found
              </div>
            ) : (
              filteredEntries.filter(e => e.type === "EXPENSE").map((entry) => (
                <div key={entry.id} className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-3.5 flex items-center justify-between border border-gray-100 border-l-4 border-l-red-500">
                  <div className="flex-1 pr-2">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{entry.description}</h4>
                    <p className="text-[11px] text-gray-500 mt-1">{entry.date ? new Date(entry.date).toLocaleDateString('en-IN') : '-'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-extrabold text-red-600 whitespace-nowrap">
                      - ₹{parseFloat(entry.amount).toLocaleString('en-IN')}
                    </p>
                    <button onClick={() => handleDelete(entry.id)} className="p-1 text-gray-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <HisabForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
