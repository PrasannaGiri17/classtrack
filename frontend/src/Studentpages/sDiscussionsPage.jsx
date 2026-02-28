import React, { useState, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Plus,
  ChevronDown,
  MoreVertical,
  Image as ImageIcon,
  Send,
  User as UserIcon,
  Clock,
  ArrowLeft,
  X,
  Lock,
  MessageCircle,
  ShieldAlert,
  GraduationCap,
  Trash2,
  AlertCircle,
  Flag
} from 'lucide-react';
import { toast } from '../MainSystemComponents/Toast';
import PortalPopup from '../MainSystemComponents/PortalPopup';
import ConfirmDialog from '../MainSystemComponents/ConfirmDialog';

// --- Mock Data ---

const CURRENT_USER = {
  id: 'u1',
  name: 'Cristiano Ronaldo',
  role: 'student',
  gradeId: '10',
  avatarUrl: 'https://picsum.photos/seed/cristiano/200/200'
};

const SUBJECTS = [
  { id: 'math', name: 'Mathematics', gradeId: '10' },
  { id: 'sci', name: 'Science', gradeId: '10' },
  { id: 'hist', name: 'History', gradeId: '10' },
  { id: 'comp', name: 'Computer Science', gradeId: '10' },
];

const INITIAL_MOCK_POSTS = [
  {
    id: 'p1',
    gradeId: '10',
    subjectId: 'math',
    authorId: 'u1',
    authorName: 'Cristiano Ronaldo',
    authorRole: 'student',
    authorAvatar: 'https://picsum.photos/seed/cristiano/200/200',
    title: 'Struggling with Sine Rule in 3D',
    body: 'I am finding it hard to visualize how the sine rule applies when we have 3D tetrahedron problems. Does anyone have a good mental trick or diagram to simplify this?',
    imageUrls: ['https://picsum.photos/seed/math1/800/400', 'https://picsum.photos/seed/math2/800/400'],
    createdAt: '2 hours ago',
    commentCount: 3
  },
  {
    id: 'p2',
    gradeId: '10',
    subjectId: 'comp',
    authorId: 't1',
    authorName: 'Prof. Carlo Ancelotti',
    authorRole: 'teacher',
    authorAvatar: 'https://picsum.photos/seed/carlo/200/200',
    title: 'Reminder: Weekly Coding Challenge',
    body: 'Just a quick reminder that this week’s challenge on recursion is live. Please ensure you try to implement it without using global variables.',
    createdAt: '4 hours ago',
    commentCount: 12
  }
];

const MOCK_COMMENTS = [
  {
    id: 'c1',
    postId: 'p1',
    authorId: 't2',
    authorName: 'Zinedine Zidane',
    authorRole: 'teacher',
    authorAvatar: 'https://picsum.photos/seed/zizou/200/200',
    body: 'Great question, Cristiano. The key is to break the 3D shape into several 2D planes. I will post a diagram shortly to illustrate the projection method.',
    createdAt: '1 hour ago'
  }
];

// --- Shared Components ---

const ImageGrid = ({ urls }) => {
  if (!urls || urls.length === 0) return null;

  return (
    <div className={`grid gap-3 mt-4 overflow-hidden rounded-3xl ${urls.length === 1 ? 'grid-cols-1' : urls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
      }`}>
      {urls.map((url, idx) => (
        <div key={idx} className={`relative overflow-hidden border border-slate-100 dark:border-slate-800 ${urls.length === 3 && idx === 0 ? 'col-span-2 aspect-[21/9]' : 'aspect-video'
          }`}>
          <img src={url} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" alt="Attached Reference" />
        </div>
      ))}
    </div>
  );
};

// --- Modals ---

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (images.length >= 3) {
        toast({ type: 'error', message: 'Maximum 3 images allowed.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePost = () => {
    if (!title || !body || !subjectId) return;
    onSubmit({ title, body, subjectId, imageUrls: images.length > 0 ? images : undefined });
    setTitle(''); setBody(''); setSubjectId(''); setImages([]);
    onClose();
    toast({ type: 'success', message: 'Discussion posted successfully!' });
  };

  return (
    <PortalPopup isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-slate-900 w-[95vw] max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col pointer-events-auto">
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Plus size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Start Discussion</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Engage with your grade community</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-10 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Related Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
            >
              <option value="">Select a Subject</option>
              {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What is your question or topic?"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Details</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Provide context, share insights, or ask for help..."
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-700 dark:text-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-inner resize-none leading-relaxed"
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 group/img">
                  <img src={img} className="w-full h-full object-cover" alt="Preview" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 p-1 bg-black/40 text-white rounded-lg backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-6 pt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= 3}
              className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-30"
            >
              <ImageIcon size={18} />
              {images.length >= 3 ? 'Max Reached' : `Attach Image (${images.length}/3)`}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

            <button
              disabled={!title || !body || !subjectId}
              onClick={handlePost}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              Post Discussion <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </PortalPopup>
  );
};

// --- Page Components ---

const DiscussionCard = ({ post, onClick, onDelete, onReport }) => {
  const subject = SUBJECTS.find(s => s.id === post.subjectId);
  const isAuthor = post.authorId === CURRENT_USER.id;

  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm p-8 group hover:shadow-xl hover:border-emerald-500/20 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-4"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group-hover:border-emerald-500/20 transition-all">
            <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{post.authorName}</h4>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border ${post.authorRole === 'teacher'
                ? 'bg-amber-50 text-amber-600 border-amber-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                {post.authorRole}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              <Clock size={12} className="text-emerald-500" />
              {post.createdAt}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-transparent group-hover:border-emerald-500/20 transition-all">
            {subject?.name}
          </span>
          {isAuthor ? (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(post.id); }}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
              title="Delete Discussion"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onReport(post.id); }}
              className="p-2 text-slate-300 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
              title="Report Discussion"
            >
              <Flag size={18} />
            </button>
          )}
          <button className="p-2 text-slate-300 hover:text-slate-500 transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 transition-colors uppercase tracking-tight">
          {post.title}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {post.body}
        </p>

        {post.imageUrls && <ImageGrid urls={post.imageUrls} />}

        <div className="flex items-center gap-6 pt-6 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
            <MessageCircle size={14} className="text-emerald-500" />
            {post.commentCount} Comments
          </div>
          <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex-1 text-right">
            Click to Participate
          </div>
        </div>
      </div>
    </div>
  );
};

const DiscussionDetailView = ({ post, onBack, onDelete, onReport }) => {
  const [commentText, setCommentText] = useState('');
  const [commentImages, setCommentImages] = useState([]);
  const [comments, setComments] = useState(MOCK_COMMENTS.filter(c => c.postId === post.id));
  const fileInputRef = useRef(null);
  const isAuthor = post.authorId === CURRENT_USER.id;

  const canComment = useMemo(() => {
    if (CURRENT_USER.role === 'student') {
      return CURRENT_USER.gradeId === post.gradeId;
    } else {
      return CURRENT_USER.subjects?.includes(post.subjectId);
    }
  }, [post]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      if (commentImages.length >= 3) {
        toast({ type: 'error', message: 'Maximum 3 images allowed.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setCommentImages(prev => [...prev, reader.result]);
      reader.readAsDataURL(files[0]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCommentImage = (idx) => {
    setCommentImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePostComment = () => {
    if (!commentText.trim() && commentImages.length === 0) return;
    const newComment = {
      id: `c${Date.now()}`,
      postId: post.id,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorRole: CURRENT_USER.role,
      authorAvatar: CURRENT_USER.avatarUrl,
      body: commentText,
      imageUrls: commentImages.length > 0 ? commentImages : undefined,
      createdAt: 'Just now'
    };
    setComments([newComment, ...comments]);
    setCommentText('');
    setCommentImages([]);
    toast({ type: 'success', message: 'Comment posted.' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Back to Stream</span>
        </button>

        <div className="flex items-center gap-4">
          {!isAuthor && (
            <button
              onClick={() => onReport(post.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest border border-amber-100 dark:border-amber-900/40"
            >
              <Flag size={16} />
              Report Post
            </button>
          )}
          {isAuthor && (
            <button
              onClick={() => onDelete(post.id)}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition-all rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-100 dark:border-red-900/40"
            >
              <Trash2 size={16} />
              Delete Post
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-10 lg:p-14 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src={post.authorAvatar} className="w-14 h-14 rounded-2xl border-4 border-slate-50 dark:border-slate-800" alt={post.authorName} />
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{post.authorName}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{post.authorRole}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full" />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{post.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest h-fit">
              {SUBJECTS.find(s => s.id === post.subjectId)?.name}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
              {post.title}
            </h2>
            <p className="text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.body}
            </p>
            {post.imageUrls && <ImageGrid urls={post.imageUrls} />}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[40px] border border-slate-200 dark:border-slate-800 p-8 space-y-8">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-emerald-500" size={20} />
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Participation Center</h3>
        </div>

        {canComment ? (
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-4 focus-within:ring-4 ring-emerald-500/5 transition-all">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Share your thoughts or answer this question..."
              className="w-full bg-transparent border-none text-base font-medium text-slate-700 dark:text-slate-200 outline-none resize-none min-h-[100px] scrollbar-hide"
            />

            {commentImages.length > 0 && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                {commentImages.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 group/cimg">
                    <img src={img} className="w-full h-full object-cover" alt="Comment attachment" />
                    <button
                      onClick={() => removeCommentImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/40 text-white rounded-md opacity-0 group-hover/cimg:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800/50">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={commentImages.length >= 3}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-emerald-500 transition-colors text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
              >
                <ImageIcon size={18} />
                {commentImages.length >= 3 ? 'Max' : `+ Image (${commentImages.length}/3)`}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />

              <button
                onClick={handlePostComment}
                disabled={!commentText.trim() && commentImages.length === 0}
                className="px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                Send Comment <Send size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-amber-50/50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex flex-col items-center text-center space-y-4">
            <Lock size={32} className="text-amber-500" />
            <div className="max-w-md">
              <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">Read Only Access</p>
              <p className="text-xs font-medium text-amber-600 dark:text-amber-500 mt-2">Only students of Grade {post.gradeId} and assigned Subject Teachers can participate in this discussion.</p>
            </div>
          </div>
        )}

        <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-5 group animate-in slide-in-from-top-4 duration-300">
              <img src={comment.authorAvatar} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0" alt={comment.authorName} />
              <div className="flex-1 bg-white dark:bg-slate-800/30 p-6 rounded-[28px] border border-slate-100 dark:border-slate-800/50 group-hover:border-emerald-500/10 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{comment.authorName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border ${comment.authorRole === 'teacher' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}>
                      {comment.authorRole}
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{comment.createdAt}</span>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {comment.body}
                </p>
                {comment.imageUrls && <ImageGrid urls={comment.imageUrls} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Main Container ---

const SDiscussionsPage = () => {
  const [posts, setPosts] = useState(INITIAL_MOCK_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Deletion States
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Report States
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [postToReport, setPostToReport] = useState(null);

  // Filter Logic
  const visiblePosts = useMemo(() => {
    return posts.filter(p => {
      if (CURRENT_USER.role === 'student' && p.gradeId !== CURRENT_USER.gradeId) return false;
      const q = searchQuery.toLowerCase();
      const matchesSearch = p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q);
      const matchesSubject = filterSubject === 'all' || p.subjectId === filterSubject;
      const matchesTab = activeTab === 'all' || p.authorId === CURRENT_USER.id;
      return matchesSearch && matchesSubject && matchesTab;
    });
  }, [posts, searchQuery, filterSubject, activeTab]);

  const handleCreatePost = (newPostData) => {
    const newPost = {
      id: `p${Date.now()}`,
      gradeId: CURRENT_USER.gradeId || '10',
      subjectId: newPostData.subjectId,
      authorId: CURRENT_USER.id,
      authorName: CURRENT_USER.name,
      authorRole: CURRENT_USER.role,
      authorAvatar: CURRENT_USER.avatarUrl,
      title: newPostData.title,
      body: newPostData.body,
      imageUrls: newPostData.imageUrls,
      createdAt: 'Just now',
      commentCount: 0,
    };
    setPosts([newPost, ...posts]);
  };

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast({ type: 'info', message: 'Discussion removed.' });
  };

  const handleReportPost = (postId) => {
    toast({ type: 'success', message: 'Post reported to moderators.' });
  };

  return (
    <div className="w-full">
      {selectedPost ? (
        <DiscussionDetailView
          post={selectedPost}
          onBack={() => setSelectedPost(null)}
          onDelete={(id) => {
            setPostToDelete(id);
            setIsDeleteDialogOpen(true);
          }}
          onReport={(id) => {
            setPostToReport(id);
            setIsReportDialogOpen(true);
          }}
        />
      ) : (
        <div className="space-y-10">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/10">
                <MessageSquare size={24} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Discussion Stream</h2>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> New Discussion
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all dark:text-slate-200"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest outline-none cursor-pointer"
              >
                <option value="all">All Subjects</option>
                {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  Stream
                </button>
                <button
                  onClick={() => setActiveTab('my')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-sm' : 'text-slate-400'}`}
                >
                  My Posts
                </button>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="grid grid-cols-1 gap-6">
            {visiblePosts.length > 0 ? (
              visiblePosts.map(p => (
                <DiscussionCard
                  key={p.id}
                  post={p}
                  onClick={() => setSelectedPost(p)}
                  onDelete={(id) => {
                    setPostToDelete(id);
                    setIsDeleteDialogOpen(true);
                  }}
                  onReport={(id) => {
                    setPostToReport(id);
                    setIsReportDialogOpen(true);
                  }}
                />
              ))
            ) : (
              <div className="py-40 text-center bg-slate-50 dark:bg-slate-900/40 rounded-[64px] border-4 border-dashed border-slate-100 dark:border-slate-800">
                <MessageCircle size={48} className="text-slate-200 mx-auto mb-6" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">No Discussions Found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => {
          if (postToDelete) {
            handleDeletePost(postToDelete);
            setIsDeleteDialogOpen(false);
            if (selectedPost?.id === postToDelete) setSelectedPost(null);
          }
        }}
        title="Delete Discussion?"
        message="This action cannot be undone. All comments under this discussion will also be removed permanently."
      />

      <ConfirmDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        onConfirm={() => {
          if (postToReport) {
            handleReportPost(postToReport);
            setIsReportDialogOpen(false);
          }
        }}
        title="Report this post?"
        message="Help us keep the community safe. Our moderators will review this discussion within 24 hours."
      />
    </div>
  );
};

export default SDiscussionsPage;