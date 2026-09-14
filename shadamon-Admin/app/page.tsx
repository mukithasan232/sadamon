"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if logged in
    const token = Cookies.get('adminToken');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold text-black tracking-tight">
            Shadamon
          </h1>
          <p className="text-xl text-black max-w-lg mx-auto leading-relaxed">
            The ultimate marketing platform for modern businesses. Scale your reach, analyze your data, and grow faster.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all hover:scale-105"
          >
            Login to Admin Access
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>

      <div className="fixed bottom-0 w-full p-6 text-center text-black text-sm">
        &copy; {new Date().getFullYear()} Shadamon Inc. All rights reserved.
      </div>
    </div>
  );
}
