"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Search } from 'lucide-react';
import { API_BASE_URL } from '../../../utils/apiConfig';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export default function ConnectLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('adminToken');
            const res = await axios.get(`${API_BASE_URL}/api/connects/logs`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setLogs(res.data.data);
        } catch (error) {
            console.error("Failed to fetch logs", error);
            toast.error("Failed to fetch connect logs");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-['Tahoma','Verdana',sans-serif]">
            {/* Header */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-md">
                <div className="flex items-center gap-3">
                    <h1 className="text-[15px] font-bold tracking-wide uppercase text-slate-100 flex items-center gap-2">
                        Connect Usage Logs
                    </h1>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-auto p-4">
                <div className="bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
                    <table className="w-full border-collapse text-left">
                        <thead className="bg-slate-100 text-slate-700">
                            <tr>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Date</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">User</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Action Type</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Target User</th>
                                <th className="px-3 py-2 text-xs font-bold uppercase border-b border-slate-200">Amount Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /></td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan={5} className="py-8 text-center text-sm text-slate-500">No logs found</td></tr>
                            ) : logs.map(log => (
                                <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-3 py-2 text-sm text-black">
                                        {new Date(log.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-3 py-2 text-sm text-black font-semibold">
                                        {log.userId?.name || 'Unknown'} <br/>
                                        <span className="text-[10px] text-slate-500 font-normal">{log.userId?.mobile}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">
                                            {log.actionType}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-black font-semibold">
                                        {log.targetUserId?.name || 'Unknown'} <br/>
                                        <span className="text-[10px] text-slate-500 font-normal">{log.targetUserId?.mobile}</span>
                                    </td>
                                    <td className="px-3 py-2 text-sm text-rose-600 font-bold text-center">
                                        -{log.amountSpent}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
