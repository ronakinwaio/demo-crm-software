"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PolicyForm from "../../../components/PolicyForm";
import { formatDisplayText } from "../../../utils/formatText";

export default function PolicyPage() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [loanTypes, setLoanTypes] = useState([]);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [formData, setFormData] = useState({
        bank_name: "",
        link: "",
        note: "",
        loan_type: "",
        pin: false,
    });

    const fetchLoanTypes = async () => {
        try {
            const response = await fetch("/api/loan-type");
            const data = await response.json();
            if (data.success) {
                setLoanTypes(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching loan types:", error);
        }
    };

    const fetchPolicies = async () => {
        try {
            const response = await fetch("/api/policies", { cache: "no-store" });
            const data = await response.json();
            if (data.success) {
                setPolicies(data.data);
            } else {
                toast.error(data.message || "Failed to load policies");
            }
        } catch (error) {
            toast.error("Failed to fetch policies");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchPolicies();
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchLoanTypes();
    }, []);

    const handleSubmit = async () => {
        try {
            const url = editingPolicy ? `/api/policies/${editingPolicy.id}` : "/api/policies";
            const method = editingPolicy ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(editingPolicy ? "Policy updated successfully" : "Policy added successfully");
                resetForm();
                fetchPolicies();
                setShowForm(false);
            } else {
                toast.error(data.message || "Operation failed");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            bank_name: policy.bank_name || "",
            link: policy.link || "",
            note: policy.note || "",
            loan_type: policy.loan_type || "",
            pin: Boolean(policy.pin),
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this policy?")) return;

        try {
            const response = await fetch(`/api/policies/${id}`, {
                method: "DELETE",
            });
            const data = await response.json();
            if (data.success) {
                toast.success("Policy deleted successfully");
                fetchPolicies();
            } else {
                toast.error(data.message || "Failed to delete policy");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const resetForm = () => {
        setFormData({ bank_name: "", link: "", note: "", loan_type: "", pin: false });
        setEditingPolicy(null);
    };

    const handleTogglePin = async (policy) => {
        try {
            const response = await fetch(`/api/policies/${policy.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...policy,
                    pin: !Boolean(policy.pin),
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPolicies(prev => prev.map(item => item.id === policy.id ? { ...item, pin: !Boolean(policy.pin) } : item));
                toast.success(policy.pin ? "Policy unpinned" : "Policy pinned");
            } else {
                toast.error(data.message || "Failed to update pin");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const handleCancel = () => {
        resetForm();
        setShowForm(false);
    };

    const truncateLink = (link, maxLength = 50) => {
        if (!link) return '-';
        if (link.length <= maxLength) return link;
        return link.substring(0, maxLength) + '...';
    };

    const sortedPolicies = [...policies].sort((a, b) => {
        if (a.pin && !b.pin) return -1;
        if (!a.pin && b.pin) return 1;
        return 0;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Policy Management</h1>
                    <p className="text-xs text-gray-500 mt-1">Add, edit, and manage bank loan policies and links.</p>
                </div>
                <div className="flex gap-3 items-center flex-wrap">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="ALL">All Loan Types</option>
                        {loanTypes.map((type) => (
                            <option key={type.id} value={type.type_name}>
                                {type.type_name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md shadow-blue-600/30 transition-all hover:scale-[1.02]"
                    >
                        + Add Policy
                    </button>
                </div>
            </div>

            {showForm && (
                <PolicyForm
                    formData={formData}
                    setFormData={setFormData}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    editingPolicy={editingPolicy}
                />
            )}

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
                <table className="min-w-full table-auto">
                    <thead className="bg-slate-50 border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider"></th>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Bank Name</th>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Loan Type</th>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Link</th>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Note</th>
                            <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedPolicies.filter(p => typeFilter === "ALL" || p.loan_type === typeFilter).length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-10 text-center text-gray-500">
                                    No policies found. Click &quot;Add Policy&quot; to create one.
                                </td>
                            </tr>
                        ) : (
                            sortedPolicies.filter(p => typeFilter === "ALL" || p.loan_type === typeFilter).map((policy, index) => (
                                <tr key={policy.id} className={index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white hover:bg-blue-50/40 transition-colors'}>
                                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTogglePin(policy);
                                            }}
                                            className={`rounded-full p-1.5 transition-all ${policy.pin ? "text-amber-500 hover:text-amber-600" : "text-gray-400 hover:text-gray-600"}`}
                                            title={policy.pin ? "Unpin policy" : "Pin policy"}
                                        >
                                            {policy.pin ? "📌" : "📍"}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm font-bold text-gray-900">
                                        {formatDisplayText(policy.bank_name, '-')}
                                    </td>
                                    <td className="px-4 py-3.5 text-sm">
                                        <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {policy.loan_type || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3.5 text-sm max-w-[200px] truncate">
                                        {policy.link ? (
                                            <a
                                                href={policy.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                title={policy.link}
                                                className="hover:underline inline-block text-blue-600 font-medium truncate"
                                            >
                                                {truncateLink(policy.link)}
                                            </a>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-sm text-gray-700">
                                        {policy.note ? (
                                            <span
                                                onClick={() => copyNote(policy.note)}
                                                title="Click to copy full note"
                                                className="cursor-pointer hover:text-blue-600 hover:underline"
                                            >
                                                {truncateNote(formatDisplayText(policy.note, '-'))}
                                            </span>
                                        ) : (
                                            "-"
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5 text-sm text-gray-700">
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => handleEdit(policy)}
                                                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 font-semibold transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(policy.id)}
                                                className="px-3 py-1 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 font-semibold transition-all"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
