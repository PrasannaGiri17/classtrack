import React, { useState } from 'react';
import {
    Download,
    Folder,
    Link as LinkIcon,
    FileText,
    X,
    Plus,
    ChevronDown,
    BookOpen
} from 'lucide-react';
import { toast } from '../../MainSystemComponents/Toast';
import PortalPopup from '../../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../../MainSystemComponents/ConfirmDialog';

import { useEffect } from 'react';
import teacherService from '../../Api/teacherService';
import contentService from '../../Api/contentService';
import { Loader2, Trash2, ChevronLeft, Download as DownloadIcon } from 'lucide-react';

const Content = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folderPath, setFolderPath] = useState([]);
    const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [folderAssignment, setFolderAssignment] = useState({ classRef: '', subject: '' });
    const [teacherData, setTeacherData] = useState({ classes: [], subjects: [], classOptions: [] });
    const [newResource, setNewResource] = useState({
        name: '',
        type: 'file',
        url: '',
        files: [],
        classRef: '',
        subject: ''
    });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);

    const removeFile = (index) => {
        setNewResource(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        fetchResources();
    }, [currentFolder]);

    useEffect(() => {
        const fetchTeacherData = async () => {
            const teacherId = localStorage.getItem('teacherId');
            if (!teacherId) return;
            try {
                const teacher = await teacherService.getTeacherById(teacherId);
                const classes = teacher.assignedClasses || [];

                const uniqueGrades = [...new Set(classes.map(c => {
                    const m = c.match(/(?:Grade\s+|G)(\d+)/i);
                    return m ? m[1] : null;
                }).filter(Boolean))];

                const wholeGradeOptions = uniqueGrades.map(g => `Whole Grade ${g}`);
                const classOptions = [...wholeGradeOptions, ...classes];

                const subjects = [];
                if (teacher.primarySubject) {
                    const name = typeof teacher.primarySubject === 'object' ? (teacher.primarySubject.subjectName || teacher.primarySubject.title) : teacher.primarySubject;
                    if (name) subjects.push(name);
                }
                if (teacher.secondarySubject) {
                    const name = typeof teacher.secondarySubject === 'object' ? (teacher.secondarySubject.subjectName || teacher.secondarySubject.title) : teacher.secondarySubject;
                    if (name && !subjects.includes(name)) subjects.push(name);
                }

                setTeacherData({ classes, subjects, classOptions });
                setNewResource(prev => ({
                    ...prev,
                    classRef: classOptions[0] || '',
                    subject: subjects[0] || ''
                }));
                setFolderAssignment({
                    classRef: classOptions[0] || '',
                    subject: subjects[0] || ''
                });
            } catch (error) {
                console.error("Failed to fetch teacher data:", error);
            }
        };
        fetchTeacherData();
    }, []);

    const fetchResources = async () => {
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId) return;
        try {
            setLoading(true);
            const data = await contentService.getTeacherResources(teacherId, currentFolder?._id || 'root');
            setResources(data);
        } catch (error) {
            toast({ type: 'error', message: 'Failed to load resources.' });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId || !newFolderName.trim()) return;

        let grade, section;
        const wholeMatch = folderAssignment.classRef.match(/Whole Grade\s+(\d+)/i);
        if (wholeMatch) {
            grade = wholeMatch[1];
            section = 'ALL';
        } else {
            const classMatch = folderAssignment.classRef.match(/(?:Grade\s+|G)(\d+)(?:\s*-\s*|\s*)([A-Za-z]+)/i);
            if (classMatch) {
                grade = classMatch[1];
                section = classMatch[2].toUpperCase();
            } else {
                grade = folderAssignment.classRef;
                section = 'N/A';
            }
        }

        try {
            const entry = {
                name: newFolderName,
                type: 'folder',
                teacherId: teacherId,
                folderId: null,
                grade,
                section,
                subject: folderAssignment.subject
            };
            await contentService.createResource(entry);
            fetchResources();
            setIsFolderModalOpen(false);
            setNewFolderName('');
            toast({ type: 'success', message: 'Folder created successfully.' });
        } catch (error) {
            toast({ type: 'error', message: 'Failed to create folder.' });
        }
    };

    const handleAddResource = async (e) => {
        e.preventDefault();
        const teacherId = localStorage.getItem('teacherId');
        if (!teacherId) {
            toast({ type: 'error', message: 'Teacher session not found.' });
            return;
        }

        let grade, section;
        const wholeMatch = newResource.classRef.match(/Whole Grade\s+(\d+)/i);
        if (wholeMatch) {
            grade = wholeMatch[1];
            section = 'ALL';
        } else {
            const classMatch = newResource.classRef.match(/(?:Grade\s+|G)(\d+)(?:\s*-\s*|\s*)([A-Za-z]+)/i);
            if (classMatch) {
                grade = classMatch[1];
                section = classMatch[2].toUpperCase();
            } else {
                grade = newResource.classRef;
                section = 'N/A';
            }
        }

        try {
            if (newResource.type === 'link') {
                const entry = {
                    name: newResource.name,
                    contentId: Date.now(), // Placeholder for unique ID
                    type: 'link',
                    url: newResource.url,
                    teacherId: teacherId,
                    folderId: currentFolder?._id || null,
                    size: '-',
                    grade: grade,
                    section: section,
                    subject: newResource.subject
                };
                await contentService.createResource(entry);
            } else {
                if (newResource.files.length === 0) {
                    toast({ type: 'error', message: 'Please select at least one file.' });
                    return;
                }

                // Upload each file as a separate resource
                const uploadPromises = newResource.files.map(async (file) => {
                    const ext = file.name.split('.').pop().toLowerCase();
                    const finalType = ['pdf', 'docx', 'doc', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif'].includes(ext) ? ext : 'file';

                    // Convert file to Base64 for internal storage/preview
                    const base64 = await new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsDataURL(file);
                    });

                    const entry = {
                        type: finalType,
                        teacherId: teacherId,
                        folderId: currentFolder?._id || null,
                        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                        fileName: file.name,
                        fileUrl: base64,
                        grade: grade,
                        section: section,
                        subject: newResource.subject
                    };
                    return contentService.createResource(entry);
                });

                await Promise.all(uploadPromises);
            }

            fetchResources();
            setIsResourceModalOpen(false);
            setNewResource({
                name: '',
                type: 'file',
                url: '',
                files: [],
                classRef: teacherData.classOptions[0] || '',
                subject: teacherData.subjects[0] || ''
            });
            toast({ type: 'success', message: 'Resource(s) shared successfully.' });
        } catch (error) {
            toast({ type: 'error', message: 'Failed to share resource(s).' });
        }
    };

    const handleDeleteClick = (id) => {
        setResourceToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeletion = async () => {
        if (!resourceToDelete) return;
        try {
            await contentService.deleteResource(resourceToDelete);
            setResources(resources.filter(r => (r._id || r.id) !== resourceToDelete));
            toast({ type: 'success', message: 'Resource deleted permanently.' });
            setIsDeleteDialogOpen(false);
            setResourceToDelete(null);
        } catch (error) {
            toast({ type: 'error', message: 'Failed to delete resource.' });
        }
    };

    const handleNavigateIn = (folder) => {
        if (folder.type !== 'folder') return;
        setFolderPath([...folderPath, folder]);
        setCurrentFolder(folder);
    };

    const handleResourceClick = (r) => {
        if (r.type === 'folder') {
            handleNavigateIn(r);
        } else if (r.type === 'link') {
            if (r.url) window.open(r.url.startsWith('http') ? r.url : `https://${r.url}`, '_blank');
        } else {
            // For files (pdf/docx)
            if (r.fileUrl) {
                const link = document.createElement('a');
                link.href = r.fileUrl;
                link.download = r.fileName || r.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast({ type: 'success', message: `Downloading: ${r.name}` });
            } else {
                toast({ type: 'error', message: "File content not found." });
            }
        }
    };

    const handleNavigateBack = () => {
        const newPath = [...folderPath];
        newPath.pop();
        setFolderPath(newPath);
        setCurrentFolder(newPath.length > 0 ? newPath[newPath.length - 1] : null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div className="flex items-center gap-3 w-fit">
                    {currentFolder && (
                        <button
                            onClick={handleNavigateBack}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-600 transition-all mr-2"
                        >
                            <ChevronLeft size={20} />
                        </button>
                    )}
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                        {currentFolder ? currentFolder.name : `Learning Resources (${resources.length})`}
                    </h3>
                </div>
                <div className="flex gap-4">
                    {!currentFolder && (
                        <button
                            onClick={() => setIsFolderModalOpen(true)}
                            className="flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                        >
                            <Folder size={18} /> Create Folder
                        </button>
                    )}
                    <button
                        onClick={() => setIsResourceModalOpen(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Add New Resource
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors h-auto">
                <div className="w-full overflow-x-auto scrollbar-hide">
                    <table className="w-full min-w-[800px] text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                <th className="pl-12 pr-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shared On</th>
                                <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
                                <th className="pr-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <Loader2 size={32} className="text-emerald-500 animate-spin" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Synchronizing Resources...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : resources.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Folder size={48} className="text-slate-400" />
                                            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No resources shared yet</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                resources.map((r) => (
                                    <tr
                                        key={r._id || r.id}
                                        onClick={() => handleResourceClick(r)}
                                        className={`group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all cursor-pointer ${r.type === 'folder' ? 'animate-in fade-in slide-in-from-left-2' : ''}`}
                                    >
                                        <td className="pl-12 pr-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${r.type === 'folder' ? 'bg-amber-50 text-amber-500' :
                                                    r.type === 'link' ? 'bg-indigo-50 text-indigo-500' :
                                                        'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                    {r.type === 'folder' ? <Folder size={18} /> :
                                                        r.type === 'link' ? <LinkIcon size={18} /> :
                                                            <FileText size={18} />}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 transition-colors truncate max-w-[300px]">
                                                        {r.name || r.fileName || r.url}
                                                    </span>
                                                    {r.type === 'link' && <span className="text-[10px] text-slate-400 truncate max-w-[300px] font-medium">{r.url}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">
                                            {r.sharedOn ? new Date(r.sharedOn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{r.size || '-'}</td>
                                        <td className="pr-12 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                {(r.type === 'pdf' || r.type === 'docx') && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleResourceClick(r); }}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                                                        title="Download"
                                                    >
                                                        <DownloadIcon size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(r._id || r.id); }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    title="Delete Permanently"
                                                >
                                                    <Trash2 size={14} />
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

            <PortalPopup isOpen={isResourceModalOpen} onClose={() => setIsResourceModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-3xl rounded-[40px] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
                    <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white">
                                <Download size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Add New Resource</h3>
                        </div>
                        <button onClick={() => setIsResourceModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={22} /></button>
                    </div>

                    <form onSubmit={handleAddResource} className="p-8 lg:p-10 space-y-10 overflow-y-auto max-h-[90vh] scrollbar-hide">
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'file', icon: FileText, label: 'File' },
                                        { id: 'link', icon: LinkIcon, label: 'Link' },
                                    ].map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setNewResource({ ...newResource, type: type.id })}
                                            className={`group flex items-center gap-4 p-5 rounded-[24px] border-2 transition-all ${newResource.type === type.id
                                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                                : 'border-slate-50 dark:border-slate-800 text-slate-400 hover:border-slate-200'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${newResource.type === type.id ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200'
                                                }`}>
                                                <type.icon size={20} />
                                            </div>
                                            <span className="text-[11px] font-black uppercase tracking-widest">{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Grade / Section</label>
                                    <div className="relative group">
                                        <select
                                            required
                                            value={newResource.classRef}
                                            onChange={(e) => setNewResource({ ...newResource, classRef: e.target.value })}
                                            className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner cursor-pointer uppercase tracking-[0.1em]"
                                        >
                                            {teacherData.classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                </div>

                                {teacherData.subjects.length > 1 ? (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teaching Subject</label>
                                        <div className="relative group">
                                            <select
                                                required
                                                value={newResource.subject}
                                                onChange={(e) => setNewResource({ ...newResource, subject: e.target.value })}
                                                className="appearance-none w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner cursor-pointer uppercase tracking-[0.1em]"
                                            >
                                                {teacherData.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                        <div className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800/50 rounded-2xl text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.1em] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                            {teacherData.subjects[0] || 'Unassigned'}
                                            <BookOpen size={14} className="opacity-30" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {newResource.type === 'link' ? (
                                <div className="space-y-8 animate-in slide-in-from-top-2 duration-200">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={newResource.name}
                                            onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                            placeholder="e.g. Reference Articles"
                                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">External URL</label>
                                        <input
                                            required
                                            type="url"
                                            value={newResource.url}
                                            onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                                            placeholder="https://example.com/lecture-notes"
                                            className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Files (Max 5)</label>
                                    <div className="min-h-[140px] p-4 bg-slate-50 dark:bg-slate-950/40 border-2 border-slate-100 dark:border-slate-800 border-dashed rounded-[32px] shadow-inner relative overflow-hidden">
                                        {newResource.files.length === 0 ? (
                                            <label className="flex flex-col items-center justify-center w-full h-[108px] cursor-pointer group">
                                                <Download className="w-8 h-8 text-slate-400 group-hover:text-emerald-500 transition-colors mb-2" />
                                                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                    Click to upload or drag & drop
                                                </span>
                                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                                    PDF, DOCX, Images, Excel, PPT
                                                </p>
                                                <input
                                                    type="file"
                                                    multiple
                                                    className="hidden"
                                                    accept=".pdf,.docx,.doc,image/*,.xlsx,.xls,.pptx,.ppt"
                                                    onChange={(e) => {
                                                        const selectedFiles = Array.from(e.target.files);
                                                        if (selectedFiles.length > 5) {
                                                            toast({ type: 'warning', message: 'Only first 5 files were added.' });
                                                            setNewResource({ ...newResource, files: selectedFiles.slice(0, 5) });
                                                        } else {
                                                            setNewResource({ ...newResource, files: selectedFiles });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        ) : (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {newResource.files.map((file, idx) => (
                                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl group/item shadow-sm">
                                                            <div className="flex items-center gap-3 min-w-0">
                                                                <div className="w-8 h-8 shrink-0 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-emerald-500">
                                                                    <FileText size={14} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate uppercase tracking-tight">
                                                                        {file.name}
                                                                    </p>
                                                                    <p className="text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(idx)}
                                                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-all"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {newResource.files.length < 5 && (
                                                        <label className="flex items-center justify-center p-2.5 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl cursor-pointer hover:bg-emerald-500/5 transition-all group/add">
                                                            <Plus size={16} className="text-slate-500 group-hover:text-emerald-500" />
                                                            <span className="ml-2 text-[9px] font-black text-slate-500 group-hover:text-emerald-500 uppercase tracking-widest">Add more</span>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                className="hidden"
                                                                accept=".pdf,.docx,.doc,image/*,.xlsx,.xls,.pptx,.ppt"
                                                                onChange={(e) => {
                                                                    const selectedFiles = Array.from(e.target.files);
                                                                    const remaining = 5 - newResource.files.length;
                                                                    if (selectedFiles.length > remaining) {
                                                                        toast({ type: 'warning', message: `Only ${remaining} more files could be added.` });
                                                                        setNewResource({
                                                                            ...newResource,
                                                                            files: [...newResource.files, ...selectedFiles.slice(0, remaining)]
                                                                        });
                                                                    } else {
                                                                        setNewResource({
                                                                            ...newResource,
                                                                            files: [...newResource.files, ...selectedFiles]
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-6 pt-4 pb-2">
                            <button
                                type="button"
                                onClick={() => setIsResourceModalOpen(false)}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[24px] transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                className="flex-1 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
                            >
                                Share Resource
                            </button>
                        </div>
                    </form>
                </div>
            </PortalPopup>

            <PortalPopup isOpen={isFolderModalOpen} onClose={() => setIsFolderModalOpen(false)}>
                <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-lg rounded-[40px] border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
                    <div className="px-8 py-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                                <Folder size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">New Folder</h3>
                        </div>
                        <button onClick={() => setIsFolderModalOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><X size={22} /></button>
                    </div>

                    <form onSubmit={handleCreateFolder} className="p-8 space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Folder Name</label>
                            <input
                                required
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="e.g. Unit 1 - Introduction"
                                className="w-full px-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[20px] text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Grade</label>
                                <div className="relative">
                                    <select
                                        value={folderAssignment.classRef}
                                        onChange={(e) => setFolderAssignment({ ...folderAssignment, classRef: e.target.value })}
                                        className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer uppercase"
                                    >
                                        {teacherData.classOptions.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                                <div className="relative">
                                    <select
                                        value={folderAssignment.subject}
                                        onChange={(e) => setFolderAssignment({ ...folderAssignment, subject: e.target.value })}
                                        className="appearance-none w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[11px] font-black dark:text-white outline-none focus:ring-4 focus:ring-amber-500/10 cursor-pointer uppercase"
                                    >
                                        {teacherData.subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsFolderModalOpen(false)}
                                className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-[20px] transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-[20px] font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
                            >
                                Create
                            </button>
                        </div>
                    </form>
                </div>
            </PortalPopup>

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDeletion}
                title="Confirm Deletion"
                message="Are you sure you want to permanently delete this resource? This action cannot be undone."
            />
        </div>
    );
};

export default Content;
