"use client";

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Edit2, Trash2, Search, CheckCircle, Save, X, Plus } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/apiConfig';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export default function PackagesManagerPage() {
    // --- State: Packages ---
    const [packages, setPackages] = useState<any[]>([]);
    const [packagesLoading, setPackagesLoading] = useState(true);
    const [packageForm, setPackageForm] = useState({
        _id: '', name: '', packageType: 'Basic', oldPrice: 0, price: 0,
        total_connects: 0, maxProfileView: 0, validDays: 30,
        bestValueSuggestion: false, checkedFeatures: '', uncheckedFeatures: '', isActive: true
    });
    const [isEditingPackage, setIsEditingPackage] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    // --- State: Premium Zone ---
    const [searchQuery, setSearchQuery] = useState('');
    const [userStats, setUserStats] = useState<any>(null);
    const [userStatsLoading, setUserStatsLoading] = useState(false);
    const [manualInject, setManualInject] = useState({ connects: 0, validDays: 0, note: '' });
    const [injectLoading, setInjectLoading] = useState(false);

    // --- State: Transactions ---
    const [transactions, setTransactions] = useState<any[]>([]);
    const [trxLoading, setTrxLoading] = useState(false);

    const getHeaders = useCallback(() => {
        return { Authorization: `Bearer ${Cookies.get('adminToken')}` };
    }, []);

    // --- Effects ---
    useEffect(() => {
        fetchPackages();
        fetchTransactions();
    }, [getHeaders]);

    // --- API: Packages ---
    const fetchPackages = async () => {
        setPackagesLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/packages`);
            setPackages(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch packages");
        } finally {
            setPackagesLoading(false);
        }
    };

    const handlePackageSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const payload = {
                ...packageForm,
                checkedFeatures: packageForm.checkedFeatures.split('\n').map(f => f.trim()).filter(Boolean),
                uncheckedFeatures: packageForm.uncheckedFeatures.split('\n').map(f => f.trim()).filter(Boolean)
            };

            if (isEditingPackage && packageForm._id) {
                await axios.put(`${API_BASE_URL}/api/packages/${packageForm._id}`, payload, { headers: getHeaders() });
                toast.success('Package updated successfully');
            } else {
                await axios.post(`${API_BASE_URL}/api/packages`, payload, { headers: getHeaders() });
                toast.success('Package created successfully');
            }
            
            resetPackageForm();
            fetchPackages();
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditPackage = (pkg: any) => {
        setPackageForm({
            ...pkg,
            checkedFeatures: pkg.checkedFeatures?.join('\n') || '',
            uncheckedFeatures: pkg.uncheckedFeatures?.join('\n') || ''
        });
        setIsEditingPackage(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeletePackage = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            await axios.delete(`${API_BASE_URL}/api/packages/${id}`, { headers: getHeaders() });
            toast.success('Package deleted');
            fetchPackages();
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const resetPackageForm = () => {
        setIsEditingPackage(false);
        setPackageForm({
            _id: '', name: '', packageType: 'Basic', oldPrice: 0, price: 0,
            total_connects: 0, maxProfileView: 0, validDays: 30,
            bestValueSuggestion: false, checkedFeatures: '', uncheckedFeatures: '', isActive: true
        });
    };

    // --- API: Premium Zone ---
    const handleSearchUser = async () => {
        if (!searchQuery.trim()) return;
        setUserStatsLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/admins/user-stats/${searchQuery.trim()}`, { headers: getHeaders() });
            setUserStats(res.data.data);
            toast.success("User loaded");
        } catch (error) {
            setUserStats(null);
            toast.error("User not found");
        } finally {
            setUserStatsLoading(false);
        }
    };

    const handleManualInject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userStats) return toast.error("Search a user first");
        
        setInjectLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/api/packages/manual-inject`, {
                userId: userStats.id,
                ...manualInject
            }, { headers: getHeaders() });
            
            toast.success("Connects injected successfully");
            setManualInject({ connects: 0, validDays: 0, note: '' });
            handleSearchUser(); // refresh stats
            fetchTransactions(); // refresh report
        } catch (error) {
            toast.error("Injection failed");
        } finally {
            setInjectLoading(false);
        }
    };

    // --- API: Transactions ---
    const fetchTransactions = async () => {
        setTrxLoading(true);
        try {
            // We just fetch the first 50 transactions for the report
            const res = await axios.get(`${API_BASE_URL}/api/admins/transactions?limit=50`, { headers: getHeaders() });
            setTransactions(res.data.data);
        } catch (error) {
            toast.error("Failed to fetch transactions");
        } finally {
            setTrxLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 p-6 bg-slate-50 min-h-screen font-['Tahoma','Verdana',sans-serif]">
            
            {/* --- 1. PACKAGE MANAGER --- */}
            <section className="bg-white border border-slate-200 rounded-sm shadow-sm p-5">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Package Manager</h2>
                    {isEditingPackage && (
                        <button onClick={resetPackageForm} className="text-sm font-bold text-rose-500 flex items-center gap-1 hover:text-rose-700">
                            <X className="w-4 h-4" /> Cancel Edit
                        </button>
                    )}
                </div>

                <form onSubmit={handlePackageSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Name</label>
                            <input type="text" required className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.name} onChange={e => setPackageForm({...packageForm, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Package Type</label>
                            <select className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                value={packageForm.packageType} onChange={e => setPackageForm({...packageForm, packageType: e.target.value})}>
                                {['Trial', 'Basic', 'Standard', 'Premium', 'Platinum', 'VIP'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Connects</label>
                            <input type="number" required min="0" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.total_connects} onChange={e => setPackageForm({...packageForm, total_connects: Number(e.target.value)})} />
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Old Price (৳)</label>
                            <input type="number" min="0" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.oldPrice} onChange={e => setPackageForm({...packageForm, oldPrice: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Package Price (৳)</label>
                            <input type="number" required min="0" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.price} onChange={e => setPackageForm({...packageForm, price: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Max Profile View</label>
                            <input type="number" required min="0" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.maxProfileView} onChange={e => setPackageForm({...packageForm, maxProfileView: Number(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Total Valid Days</label>
                            <input type="number" required min="1" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none" 
                                value={packageForm.validDays} onChange={e => setPackageForm({...packageForm, validDays: Number(e.target.value)})} />
                        </div>
                        
                        <div className="flex items-center md:col-span-2 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700">
                                <input type="checkbox" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
                                    checked={packageForm.bestValueSuggestion} onChange={e => setPackageForm({...packageForm, bestValueSuggestion: e.target.checked})} />
                                Best Value Suggestion
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-700 ml-6">
                                <input type="checkbox" className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-300"
                                    checked={packageForm.isActive} onChange={e => setPackageForm({...packageForm, isActive: e.target.checked})} />
                                Is Active
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Checked Features (One per line)</label>
                            <textarea rows={4} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                value={packageForm.checkedFeatures} onChange={e => setPackageForm({...packageForm, checkedFeatures: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Unchecked Features (One per line)</label>
                            <textarea rows={4} className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                value={packageForm.uncheckedFeatures} onChange={e => setPackageForm({...packageForm, uncheckedFeatures: e.target.value})} />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={formLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-sm text-sm uppercase tracking-wider flex items-center gap-2 transition-colors disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isEditingPackage ? 'Update Package' : 'Save Package'}
                        </button>
                    </div>
                </form>

                {/* Packages Table */}
                <div className="mt-8 border border-slate-200 rounded-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Name</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Type</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Connects</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Price</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Validity</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {packagesLoading ? (
                                <tr><td colSpan={6} className="p-6 text-center text-slate-400">Loading packages...</td></tr>
                            ) : packages.map(pkg => (
                                <tr key={pkg._id} className="hover:bg-slate-50">
                                    <td className="p-3 text-sm font-bold text-slate-800">{pkg.name} {pkg.bestValueSuggestion && <span className="text-[10px] bg-amber-100 text-amber-700 px-1 py-0.5 rounded ml-1 uppercase">Best</span>}</td>
                                    <td className="p-3 text-sm text-slate-600">{pkg.packageType}</td>
                                    <td className="p-3 text-sm text-slate-600 font-semibold">{pkg.total_connects}</td>
                                    <td className="p-3 text-sm text-slate-600">
                                        {pkg.oldPrice > 0 && <span className="line-through text-slate-400 mr-2">৳{pkg.oldPrice}</span>}
                                        <span className="font-bold text-emerald-600">৳{pkg.price}</span>
                                    </td>
                                    <td className="p-3 text-sm text-slate-600">{pkg.validDays} Days</td>
                                    <td className="p-3 text-center">
                                        <button onClick={() => handleEditPackage(pkg)} className="text-blue-500 hover:text-blue-700 p-1 mx-1"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeletePackage(pkg._id)} className="text-rose-500 hover:text-rose-700 p-1 mx-1"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* --- 2. PREMIUM ZONE --- */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Search & Stats */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col h-full">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-4">Premium Zone <span className="text-sm font-normal text-slate-500 lowercase">(Auto manual package run)</span></h2>
                    
                    <div className="flex gap-2 mb-6">
                        <input type="text" placeholder="Search by email / number / Id" className="flex-1 border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearchUser()} />
                        <button onClick={handleSearchUser} disabled={userStatsLoading} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-sm text-sm font-bold flex items-center gap-2">
                            <Search className="w-4 h-4" /> {userStatsLoading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {userStats ? (
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Connect</span>
                                <span className="text-3xl font-bold text-emerald-600">{userStats.connectsBalance}</span>
                            </div>
                            <div className="bg-slate-50 p-4 border border-slate-100 rounded-sm flex flex-col items-center justify-center text-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Validity Date</span>
                                <span className="text-lg font-bold text-slate-700">
                                    {userStats.validityDate ? new Date(userStats.validityDate).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="col-span-2 bg-indigo-50 p-4 border border-indigo-100 rounded-sm">
                                <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 text-center">View History</h3>
                                <div className="flex justify-between px-4">
                                    <div className="text-center"><div className="text-xl font-bold text-indigo-600">{userStats.viewHistory.userSeen}</div><div className="text-[10px] uppercase font-bold text-indigo-400">User Seen</div></div>
                                    <div className="text-center"><div className="text-xl font-bold text-indigo-600">{userStats.viewHistory.othersSeen}</div><div className="text-[10px] uppercase font-bold text-indigo-400">Others Seen</div></div>
                                    <div className="text-center"><div className="text-xl font-bold text-indigo-900">{userStats.viewHistory.totalSeen}</div><div className="text-[10px] uppercase font-bold text-indigo-500">Total Seen</div></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10">
                            <Search className="w-10 h-10 mb-2 opacity-50" />
                            <p className="text-sm font-medium">Search a user to view stats</p>
                        </div>
                    )}
                </div>

                {/* Provide Manually */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 h-full">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide mb-4 text-center">Provide Manually</h2>
                    
                    <form onSubmit={handleManualInject} className="space-y-4 max-w-sm mx-auto flex flex-col h-[calc(100%-2rem)]">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Add Connects</label>
                            <input type="number" required min="1" className="w-full border border-slate-300 rounded-sm px-3 py-3 text-lg font-bold text-center focus:border-emerald-500 outline-none"
                                value={manualInject.connects || ''} onChange={e => setManualInject({...manualInject, connects: Number(e.target.value)})} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Extend Validity (Days)</label>
                            <input type="number" required min="0" className="w-full border border-slate-300 rounded-sm px-3 py-3 text-lg font-bold text-center focus:border-emerald-500 outline-none"
                                value={manualInject.validDays || ''} onChange={e => setManualInject({...manualInject, validDays: Number(e.target.value)})} placeholder="30" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Note / Transaction Item</label>
                            <input type="text" className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-500 outline-none"
                                value={manualInject.note} onChange={e => setManualInject({...manualInject, note: e.target.value})} placeholder="e.g. Free gift / Manual Bank Pay" />
                        </div>

                        <div className="mt-auto pt-4">
                            <button type="submit" disabled={!userStats || injectLoading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-sm uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {injectLoading ? 'Processing...' : 'Confirm Injection'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* --- 3. TRANSACTION REPORT --- */}
            <section className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Transaction Report (All)</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200 w-10 text-center"><input type="checkbox" /></th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Trx Date</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Trx ID</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Seller ID / Name</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Amount</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Pay Type</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Payee Name</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Item</th>
                                <th className="p-3 text-xs font-bold uppercase border-b border-slate-200">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {trxLoading ? (
                                <tr><td colSpan={9} className="p-6 text-center text-slate-400">Loading transactions...</td></tr>
                            ) : transactions.map(trx => (
                                <tr key={trx._id} className="hover:bg-slate-50">
                                    <td className="p-3 text-center"><input type="checkbox" /></td>
                                    <td className="p-3 text-sm text-slate-600">{new Date(trx.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3 text-sm font-mono text-slate-700">{trx.tnxId}</td>
                                    <td className="p-3 text-sm text-slate-800 font-medium">{trx.sellerId?.name || 'N/A'}</td>
                                    <td className="p-3 text-sm font-bold text-emerald-600">৳{trx.amount}</td>
                                    <td className="p-3 text-sm text-slate-600">{trx.payType}</td>
                                    <td className="p-3 text-sm text-slate-600">{trx.payeeName}</td>
                                    <td className="p-3 text-sm text-slate-800">{trx.item}</td>
                                    <td className="p-3 text-sm">
                                        <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider", 
                                            trx.status === 'VALID' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                                            {trx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!trxLoading && transactions.length === 0 && (
                                <tr><td colSpan={9} className="p-6 text-center text-slate-400 font-medium">No transactions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    );
}
