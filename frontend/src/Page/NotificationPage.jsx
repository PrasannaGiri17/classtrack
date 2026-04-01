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
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NOTIFICATIONS = [
    {
        id: 'n1',
        title: 'New Student Registration',
        message: 'A new student, Emma Watson, has been registered in Grade 10-A.',
        type: 'success',
        category: 'users',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        isRead: false,
    },
    {
        id: 'n2',
        title: 'Fee Payment Received',
        message: 'Payment of $500 received from John Doe (Grade 8-B) for Term 1 Tuition.',
        type: 'success',
        category: 'finance',
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
        isRead: false,
    },
    {
        id: 'n3',
        title: 'System Maintenance Alert',
        message: 'Scheduled system maintenance will occur tonight from 2:00 AM to 4:00 AM. Expect brief downtime.',
        type: 'warning',
        category: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
    },
    {
        id: 'n4',
        title: 'New Faculty Request',
        message: 'Mr. Anderson has requested approval for a new Science Lab equipment purchase.',
        type: 'info',
        category: 'academic',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        isRead: true,
    },
    {
        id: 'n5',
        title: 'Failed Login Attempt',
        message: 'Multiple failed login attempts detected for user admin@school.com from IP 192.168.1.105.',
        type: 'alert',
        category: 'system',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        isRead: true,
    },
];

const NotificationPage = () => {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleMarkAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleDelete = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
        const matchesUnread = showUnreadOnly ? !n.isRead : true;

        return matchesSearch && matchesCategory && matchesUnread;
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'finance': return <CreditCard className="w-4 h-4" />;
            case 'users': return <UserPlus className="w-4 h-4" />;
            case 'academic': return <FileText className="w-4 h-4" />;
            case 'system': return <Settings className="w-4 h-4" />;
            default: return null;
        }
    };

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
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                        >
                            <CheckCheck className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
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

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    {['all', 'system', 'finance', 'users', 'academic'].map(category => (
                        <button
                            key={category}
                            onClick={() => setFilterCategory(category)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all ${filterCategory === category
                                    ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                <AnimatePresence>
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border transition-all border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md cursor-pointer"
                                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                            >
                                {!notification.isRead && (
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
                                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider rounded-md flex items-center gap-1">
                                                    {getCategoryIcon(notification.category)}
                                                    {notification.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium shrink-0">
                                                <Clock className="w-3.5 h-3.5" />
                                                {format(notification.timestamp, 'MMM d, h:mm a')}
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
                                                handleDelete(notification.id);
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
            </div>
        </div>
    );
};

export default NotificationPage;