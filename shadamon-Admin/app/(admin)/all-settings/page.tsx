"use client";

import React, { useState, useEffect } from 'react';
import { Home, X, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../utils/apiConfig';
import { getImageUrl } from '../../../utils/imageUrl';

export default function SettingsAdminPage() {
    const [tags, setTags] = useState<string[]>([]);
    const [descriptionTags, setDescriptionTags] = useState<string[]>([]);
    const [productAutoInactiveTime, setProductAutoInactiveTime] = useState<number>(90);
    const [userRepeatAdViewTime, setUserRepeatAdViewTime] = useState<number>(3);
    const [adReShowAfterMinutes, setAdReShowAfterMinutes] = useState<number>(0);
    const [productPhotoLimit, setProductPhotoLimit] = useState<number>(5);

    const [siteLogo, setSiteLogo] = useState<File | null>(null);
    const [favIcon, setFavIcon] = useState<File | null>(null);
    const [watermarkLogo, setWatermarkLogo] = useState<File | null>(null);
    const [ogImage, setOgImage] = useState<File | null>(null);

    const [siteLogoPreview, setSiteLogoPreview] = useState<string>('');
    const [favIconPreview, setFavIconPreview] = useState<string>('');
    const [watermarkLogoPreview, setWatermarkLogoPreview] = useState<string>('');
    const [ogImagePreview, setOgImagePreview] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = Cookies.get('adminToken');
                const res = await fetch(`${API_BASE_URL}/api/settings`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await res.json();
                if (data.success && data.data) {
                    const settingsData = data.data;
                    setProductAutoInactiveTime(settingsData.productAutoInactiveTime !== undefined ? settingsData.productAutoInactiveTime : 90);
                    setUserRepeatAdViewTime(settingsData.userRepeatAdViewTime !== undefined ? settingsData.userRepeatAdViewTime : 3);
                    setAdReShowAfterMinutes(settingsData.adReShowAfterMinutes !== undefined ? settingsData.adReShowAfterMinutes : 0);
                    setProductPhotoLimit(settingsData.productPhotoLimit !== undefined ? settingsData.productPhotoLimit : 5);
                    if (settingsData.blockCheckInHeadline && Array.isArray(settingsData.blockCheckInHeadline)) {
                        setTags(settingsData.blockCheckInHeadline.filter((t: string) => t && t.trim() !== ""));
                    }
                    if (settingsData.blockCheckInDescription && Array.isArray(settingsData.blockCheckInDescription)) {
                        setDescriptionTags(settingsData.blockCheckInDescription.filter((t: string) => t && t.trim() !== ""));
                    }
                    if (settingsData.siteLogo) setSiteLogoPreview(getImageUrl(settingsData.siteLogo));
                    if (settingsData.favIcon) setFavIconPreview(getImageUrl(settingsData.favIcon));
                    if (settingsData.watermarkLogo) setWatermarkLogoPreview(getImageUrl(settingsData.watermarkLogo));
                    if (settingsData.ogImage) setOgImagePreview(getImageUrl(settingsData.ogImage));
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const removeTag = (indexToRemove: number) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };

    const removeDescriptionTag = (indexToRemove: number) => {
        setDescriptionTags(descriptionTags.filter((_, index) => index !== indexToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value && !tags.includes(value)) {
                setTags([...tags, value]);
            }
            e.currentTarget.value = '';
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = e.currentTarget.value.trim();
            if (value && !descriptionTags.includes(value)) {
                setDescriptionTags([...descriptionTags, value]);
            }
            e.currentTarget.value = '';
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = Cookies.get('adminToken');
            const formData = new FormData();

            formData.append('productAutoInactiveTime', productAutoInactiveTime.toString());
            formData.append('userRepeatAdViewTime', userRepeatAdViewTime.toString());
            formData.append('adReShowAfterMinutes', adReShowAfterMinutes.toString());
            formData.append('productPhotoLimit', productPhotoLimit.toString());

            formData.append('blockCheckInHeadline', JSON.stringify(tags));
            formData.append('blockCheckInDescription', JSON.stringify(descriptionTags));

            if (siteLogo) formData.append('siteLogo', siteLogo);
            if (favIcon) formData.append('favIcon', favIcon);
            if (watermarkLogo) formData.append('watermarkLogo', watermarkLogo);
            if (ogImage) formData.append('ogImage', ogImage);

            const res = await fetch(`${API_BASE_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Settings updated successfully");
                if (data.data.siteLogo) setSiteLogoPreview(getImageUrl(data.data.siteLogo));
                if (data.data.favIcon) setFavIconPreview(getImageUrl(data.data.favIcon));
                if (data.data.watermarkLogo) setWatermarkLogoPreview(getImageUrl(data.data.watermarkLogo));
                if (data.data.ogImage) setOgImagePreview(getImageUrl(data.data.ogImage));
                setSiteLogo(null);
                setFavIcon(null);
                setWatermarkLogo(null);
                setOgImage(null);
            } else {
                toast.error(data.message || "Failed to update settings");
            }
        } catch (error) {
            console.error("Error updating settings:", error);
            toast.error("An error occurred while saving");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8">Loading settings...</div>;
    }

    return (
        <div className="space-y-4 font-sans w-full max-w-[1200px] mt-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-500 text-[13px] mb-3 px-1">
                <Home className="w-3.5 h-3.5 text-black" />
                <span className="text-slate-400">/</span>
                <span className="font-normal text-slate-500">Settings Admin</span>
            </div>

            {/* Form Container */}
            <div className="bg-white p-6 pb-6 md:p-8 md:pb-8 shadow-sm rounded border border-slate-100 ml-1">
                {/* Inputs wrapper */}
                <div className="space-y-3.5 w-full max-w-[650px]">
                    {/* Site logo */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">Site logo</label>
                        <div className="flex-1 flex justify-between items-center pr-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSiteLogo(e.target.files ? e.target.files[0] : null)}
                                className="block w-auto text-[13px] text-slate-600 file:mr-4 file:py-1 file:px-2.5 file:rounded-[3px] file:border file:border-slate-300 file:text-[13px] file:text-[#333] file:bg-[#f3f4f6] hover:file:bg-slate-200 transition-colors cursor-pointer outline-none"
                            />
                            {/* Preview box */}
                            {(siteLogoPreview || siteLogo) && (
                                <div className="w-[42px] h-[32px] border border-slate-200 rounded-[4px] ml-4 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={siteLogo ? URL.createObjectURL(siteLogo) : siteLogoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fav icon */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">Fav icon</label>
                        <div className="flex-1 flex justify-between items-center pr-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFavIcon(e.target.files ? e.target.files[0] : null)}
                                className="block w-auto text-[13px] text-slate-600 file:mr-4 file:py-1 file:px-2.5 file:rounded-[3px] file:border file:border-slate-300 file:text-[13px] file:text-[#333] file:bg-[#f3f4f6] hover:file:bg-slate-200 transition-colors cursor-pointer outline-none"
                            />
                            {/* Preview box */}
                            {(favIconPreview || favIcon) && (
                                <div className="w-[42px] h-[32px] border border-slate-200 rounded-[4px] ml-4 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={favIcon ? URL.createObjectURL(favIcon) : favIconPreview} alt="Fav Icon preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Watermark Logo */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">Watermark Logo</label>
                        <div className="flex-1 flex justify-between items-center pr-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setWatermarkLogo(e.target.files ? e.target.files[0] : null)}
                                className="block w-auto text-[13px] text-slate-600 file:mr-4 file:py-1 file:px-2.5 file:rounded-[3px] file:border file:border-slate-300 file:text-[13px] file:text-[#333] file:bg-[#f3f4f6] hover:file:bg-slate-200 transition-colors cursor-pointer outline-none"
                            />
                            {/* Preview box */}
                            {(watermarkLogoPreview || watermarkLogo) && (
                                <div className="w-[42px] h-[32px] border border-slate-200 rounded-[4px] ml-4 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={watermarkLogo ? URL.createObjectURL(watermarkLogo) : watermarkLogoPreview} alt="Watermark preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* OG Image */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">OG Image <span className="text-slate-400 text-[11px]">(1200×630)</span></label>
                        <div className="flex-1 flex justify-between items-center pr-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setOgImage(e.target.files ? e.target.files[0] : null)}
                                className="block w-auto text-[13px] text-slate-600 file:mr-4 file:py-1 file:px-2.5 file:rounded-[3px] file:border file:border-slate-300 file:text-[13px] file:text-[#333] file:bg-[#f3f4f6] hover:file:bg-slate-200 transition-colors cursor-pointer outline-none"
                            />
                            {/* Preview box */}
                            {(ogImagePreview || ogImage) && (
                                <div className="w-[63px] h-[32px] border border-slate-200 rounded-[4px] ml-4 bg-white shadow-sm flex items-center justify-center overflow-hidden">
                                    <img src={ogImage ? URL.createObjectURL(ogImage) : ogImagePreview} alt="OG image preview" className="w-full h-full object-contain" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Auto Inactive Time */}
                    <div className="flex items-center pt-1">
                        <label className="w-[200px] text-[#333] text-[13px]">Product Auto Inactive Time</label>
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="number"
                                value={productAutoInactiveTime}
                                onChange={(e) => setProductAutoInactiveTime(parseInt(e.target.value) || 0)}
                                className="w-[120px] text-[13px] border border-slate-200 rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                            />
                            <span className="text-[13px] text-[#333]">dayz</span>
                        </div>
                    </div>

                    {/* User Repeat Ad view time */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">User Repeat Ad view time</label>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={userRepeatAdViewTime}
                                onChange={(e) => setUserRepeatAdViewTime(parseInt(e.target.value) || 0)}
                                className="w-full text-[13px] border border-slate-200 rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                            />
                        </div>
                    </div>

                    {/* Re-showing after minutes */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">Re-showing after minutes</label>
                        <div className="flex-1 flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                value={adReShowAfterMinutes}
                                onChange={(e) => setAdReShowAfterMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                                className="w-full text-[13px] border border-slate-200 rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                            />
                            <span className="text-[13px] text-[#333] whitespace-nowrap">min (0 = off)</span>
                        </div>
                    </div>

                    {/* Product photo limit */}
                    <div className="flex items-center">
                        <label className="w-[200px] text-[#333] text-[13px]">Product photo limit</label>
                        <div className="flex-1">
                            <input
                                type="number"
                                value={productPhotoLimit}
                                onChange={(e) => setProductPhotoLimit(parseInt(e.target.value) || 0)}
                                className="w-full text-[13px] border border-slate-200 rounded-[4px] px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50"
                            />
                        </div>
                    </div>

                    {/* Block Check In Headline */}
                    <div className="flex items-start">
                        <label className="w-[200px] text-[#333] text-[13px] mt-2">Block Check In Headline</label>
                        <div className="flex-1 min-h-[42px] border border-slate-200 rounded-[4px] p-1.5 flex flex-wrap gap-1 resize-y overflow-auto focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/50 bg-white">
                            {tags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1.5 bg-[#f3f4f6] border border-slate-300 text-[11px] text-black font-medium px-1.5 py-0.5 rounded shadow-sm h-[22px]">
                                    {tag}
                                    <button
                                        onClick={() => removeTag(i)}
                                        className="text-slate-500 hover:text-red-500 bg-white border border-slate-300 rounded-[2px] w-3 h-3 flex items-center justify-center leading-none"
                                        type="button"
                                    >
                                        <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                    </button>
                                </span>
                            ))}
                            <textarea
                                onKeyDown={handleKeyDown}
                                placeholder="Press Enter to add words"
                                className="flex-1 min-w-[120px] outline-none text-[13px] resize-none bg-transparent self-stretch pt-0.5 pl-0.5 text-[#333]"
                                rows={1}
                            />
                        </div>
                    </div>

                    {/* Block check In Description */}
                    <div className="flex items-start">
                        <label className="w-[200px] text-[#333] text-[13px] mt-2">Block check In Description</label>
                        <div className="flex-1 min-h-[42px] border border-slate-200 rounded-[4px] p-1.5 flex flex-wrap gap-1 resize-y overflow-auto focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400/50 bg-white">
                            {descriptionTags.map((tag, i) => (
                                <span key={i} className="flex items-center gap-1.5 bg-[#f3f4f6] border border-slate-300 text-[11px] text-black font-medium px-1.5 py-0.5 rounded shadow-sm h-[22px]">
                                    {tag}
                                    <button
                                        onClick={() => removeDescriptionTag(i)}
                                        className="text-slate-500 hover:text-red-500 bg-white border border-slate-300 rounded-[2px] w-3 h-3 flex items-center justify-center leading-none"
                                        type="button"
                                    >
                                        <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                    </button>
                                </span>
                            ))}
                            <textarea
                                onKeyDown={handleDescriptionKeyDown}
                                placeholder="Press Enter to add words"
                                className="flex-1 min-w-[120px] outline-none text-[13px] resize-none bg-transparent self-stretch pt-0.5 pl-0.5 text-[#333]"
                                rows={1}
                            />
                        </div>
                    </div>
                </div>

                {/* Gray Box */}
                <div className="mt-8 mb-5 bg-[#f8f9fb] h-16 w-full rounded-[4px]"></div>

                {/* Save Button */}
                <div className="w-full">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-[#6560F0] hover:bg-[#5751d9] text-white text-[14px] px-8 py-2.5 rounded shadow-sm flex items-center justify-start transition-colors font-normal tracking-wide disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
