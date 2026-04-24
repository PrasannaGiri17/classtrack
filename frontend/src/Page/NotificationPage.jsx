import React, { useState } from 'react';
import {
    Bell,
    CheckCircle2,
    AlertCircle,
    Info,
    Clock,
    Filter,
    Search,
    MoreVertical,
    Trash2,
    CheckCheck,
    CreditCard,
    UserPlus,
    FileText,
    Settings
} from 'lucide-react';
import schoolNotificationService from '../Api/schoolNotificationService';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotificationPage = () => {
    const { user } = useAuth();
    const userId = user?._id || user?.userId;
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    React.useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const role = localStorage.getItem("role");
                const teacherId = localStorage.getItem("teacherId");
                const studentId = localStorage.getItem("studentId");
                const adminId = localStorage.getItem("adminId");

                let data = [];
                if (role === 'teacher' && teacherId && teacherId !== "undefined" && teacherId !== "null") {
                    data = await schoolNotificationService.getNotifications('teacher', teacherId);
                } else if (role === 'student' && studentId && studentId !== "undefined" && studentId !== "null") {
                    data = await schoolNotificationService.getNotifications('student', studentId);
                } else if (role === 'admin') {
                    data = await schoolNotificationService.getNotifications('admin', adminId);
                } else {
                    data = await schoolNotificationService.getNotifications(role);
                }
                setNotifications(data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    const handleMarkAllRead = async () => {
        try {
            const role = localStorage.getItem("role");
            await schoolNotificationService.markAllAsRead(role || 'student');
            setNotifications(prev => prev.map(n => ({
                ...n,
                readBy: [...(new Set([...(n.readBy || []), userId]))]
            })));
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await schoolNotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, readBy: [...(n.readBy || []), userId] } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await schoolNotificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification:", error);
        }
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesUnread = !showUnreadOnly || !n.readBy?.includes(userId);

        return matchesSearch && matchesUnread;
    });

    const unreadCount = notifications.filter(n => !n.readBy?.includes(userId)).length;


    const getTypeStyles = (type) => {
        switch (type) {
            case 'success': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'alert': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            case 'warning': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            case 'info': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
            default: return '';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5" />;
            case 'alert': return <AlertCircle className="w-5 h-5" />;
            case 'warning': return <AlertCircle className="w-5 h-5" />;
            case 'info': return <Info className="w-5 h-5" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Bell className="w-5 h-5" />
                        </div>
                        Activity Notifications
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Monitor system activities, alerts, and recent updates.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-transparent rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
                    <button
                        onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${showUnreadOnly
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Filter className="w-4 h-4" />
                        Unread Only
                        {unreadCount > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[10px] ${showUnreadOnly ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-100 dark:shadow-none transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching announcements...</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredNotifications.length > 0 ? (
                            filteredNotifications.map((notification) => (
                                <motion.div
                                    key={notification._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="group relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer"
                                    onClick={() => {
                                        const isRead = notification.readBy?.includes(userId);
                                        if (!isRead) handleMarkAsRead(notification._id);
                                    }}
                                >
                                    {!(notification.readBy?.includes(userId)) && (
                                        <>
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                                        </>
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${getTypeStyles(notification.type)}`}>
                                            {getTypeIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-base font-bold truncate text-slate-900 dark:text-white">
                                                        {notification.title}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium shrink-0">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(notification.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>

                                            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                                {notification.message}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification._id);
                                                }}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors tooltip-trigger"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed"
                            >
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No activities found</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
                                    You're all caught up! There are no new activities matching your current filters.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </div >
    );
};

export default NotificationPage;