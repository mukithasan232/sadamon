"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from '../../../utils/apiConfig';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const API_BASE = `${API_BASE_URL}/api/packages`;

export default function PackagesPage() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', price: 0, total_connects: 0, isActive: true });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE);
            setPackages(res.data.data);
        } catch (error) {
            console.error("Failed to fetch packages", error);
            toast.error("Failed to fetch packages");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (pkg: any = null) => {
        if (pkg) {
            setEditingPackage(pkg);
            setFormData({ name: pkg.name, price: pkg.price, total_connects: pkg.total_connects, isActive: pkg.isActive });
        } else {
            setEditingPackage(null);
            setFormData({ name: '', price: 0, total_connects: 0, isActive: true });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            const token = Cookies.get('adminToken');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (editingPackage) {
                await axios.put(`${API_BASE}/${editingPackage._id}`, formData, { headers });
                toast.success('Package updated successfully');
            } else {
                await axios.post(API_BASE, formData, { headers });
                toast.success('Package created successfully');
            }
            fetchPackages();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Form submit error", error);
            toast.error("An error occurred");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this package?')) return;
        try {
            const token = Cookies.get('adminToken');
            await axios.delete(`${API_BASE}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            toast.success('Package deleted');
            fetchPackages();
        } catch (error) {
            console.error("Delete error", error);
            toast.error("Failed to delete package");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-['Tahoma','Verdana',sans-serif]">
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <h1 className="text-[15px] font-bold tracking-wide uppercase text-slate-100 flex items-center gap-2">
                        Package Management
                    </h1>
                </div>
                <button onClick={() => handleOpenModal()} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm font-bold flex items-center gap-1 shadow-sm transition-colors text-xs">
                    <Plus className="w-3.5 h-3.5" /> Create Package
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Name</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Price (BDT)</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Connects</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Status</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /></td></tr>
                            ) : packages.map(pkg => (
                                <tr key={pkg._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2 text-sm text-black font-semibold">{pkg.name}</td>
                                    <td className="px-3 py-2 text-sm text-black">৳ {pkg.price}</td>
                                    <td className="px-3 py-2 text-sm text-black font-bold text-indigo-600">{pkg.total_connects}</td>
                                    <td className="px-3 py-2 text-sm">
                                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", pkg.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                                            {pkg.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => handleOpenModal(pkg)} className="text-blue-500 hover:text-blue-700 p-1 mx-1">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(pkg._id)} className="text-rose-500 hover:text-rose-700 p-1 mx-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border border-slate-200 w-full max-w-md rounded-md shadow-2xl relative z-10 font-['Tahoma','Verdana',sans-serif] overflow-hidden">
                            <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-800 uppercase">{editingPackage ? 'Edit Package' : 'Create Package'}</span>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-200 p-1 rounded-sm transition-colors"><X className="w-4 h-4 text-slate-600" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Package Name</label>
                                    <input 
                                        type="text" required 
                                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-indigo-500" 
                                        value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (BDT)</label>
                                    <input 
                                        type="number" required min="0" 
                                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-indigo-500" 
                                        value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Total Connects</label>
                                    <input 
                                        type="number" required min="1" 
                                        className="w-full border border-slate-300 rounded-sm px-3 py-2 text-sm outline-none focus:border-indigo-500" 
                                        value={formData.total_connects} onChange={(e) => setFormData({...formData, total_connects: Number(e.target.value)})} 
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" id="isActive"
                                        className="w-4 h-4 cursor-pointer"
                                        checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} 
                                    />
                                    <label htmlFor="isActive" className="text-sm font-bold text-slate-700 cursor-pointer">Active Package</label>
                                </div>

                                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-sm hover:bg-slate-200">Cancel</button>
                                    <button type="submit" disabled={formLoading} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                                        {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        {editingPackage ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
