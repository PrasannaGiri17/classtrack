import { motion } from 'motion/react';
import { FaRegUser } from "react-icons/fa6";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    School,
    Calendar,
    Bell,
    BookOpen,
    CheckCircle2,
    Star,
    ArrowRight,
    Play,
    Check,
    Twitter,
    Github,
    Linkedin,
    Sun,
    Moon
} from 'lucide-react';
import { useState, useEffect } from 'react';

const FadeInUp = ({ children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay }}
    >
        {children}
    </motion.div>
);

const BackgroundGlow = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
    </div>
);

export default function LandingPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-navy-900 text-white' : 'bg-gray-50 text-gray-900'} selection:bg-emerald-500/30`}>
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-navy-900/90 border-navy-800' : 'bg-white/90 border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-emerald-500" />
                        <span className={`font-display font-bold text-2xl tracking-tight ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>ClassTrack</span>
                    </div>
                    <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How it Works</a>
                        <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'text-gray-300 hover:bg-navy-800' : 'text-gray-600 hover:bg-gray-100'}`}
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button className={`hidden md:block text-sm font-medium transition-colors hover:text-emerald-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Log in</button>
                        <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                            Get Started Free
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                    <BackgroundGlow />
                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium mb-8 ${isDarkMode ? 'bg-navy-800 border-navy-700 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}
                            >
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                ClassTrack OS 2.0 is now live
                            </motion.div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 leading-tight"
                            >
                                Run Your School. <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Smarter.</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className={`text-lg md:text-xl mb-10 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                            >
                                The Modern School OS — Manage Every Classroom, Teacher & Student in One Place. Eliminate paperwork and streamline your administration.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            >
                                <button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-navy-900 font-semibold px-8 py-4 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 text-lg">
                                    Get Started Free <ArrowRight className="w-5 h-5" />
                                </button>
                                <button className={`w-full sm:w-auto border font-medium px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-lg ${isDarkMode ? 'bg-navy-800 hover:bg-navy-700 border-navy-700 text-white' : 'bg-white hover:bg-gray-50 border-gray-200 text-navy-900'}`}>
                                    <Play className="w-5 h-5" /> See Demo
                                </button>
                            </motion.div>
                        </div>

                        {/* Floating UI Mockup */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="mt-20 relative mx-auto max-w-5xl"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent z-10 bottom-0 h-1/2 top-auto" />
                            <div className={`rounded-2xl border p-4 shadow-2xl overflow-hidden backdrop-blur-xl ${isDarkMode ? 'border-navy-700 bg-navy-800/50' : 'border-gray-200 bg-white/80'}`}>
                                <div className="flex items-center gap-2 mb-4 px-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Total Students", value: "1,248", trend: "+12% this year" },
                                        { label: "Active Teachers", value: "84", trend: "Fully staffed" },
                                        { label: "Pass Rate", value: "94.2%", trend: "+2.4% from last term", positive: true },
                                        { label: "Fail Rate", value: "5.8%", trend: "-2.4% from last term", positive: true }
                                    ].map((stat, i) => (
                                        <div key={i} className={`border rounded-xl p-5 ${isDarkMode ? 'bg-navy-900/80 border-navy-700' : 'bg-gray-50 border-gray-100'}`}>
                                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
                                            <p className={`text-3xl font-display font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>{stat.value}</p>
                                            <p className={`text-xs ${stat.positive ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') : 'text-gray-500'}`}>{stat.trend}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Bar */}
                <section className={`border-y py-12 ${isDarkMode ? 'border-navy-700 bg-navy-800/30' : 'border-gray-200 bg-white'}`}>
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: "1,200+", label: "Students Managed" },
                                { value: "50+", label: "Schools" },
                                { value: "99.9%", label: "Uptime" },
                                { value: "10+", label: "Modules" }
                            ].map((stat, i) => (
                                <FadeInUp key={i} delay={i * 0.1}>
                                    <div className={`font-display font-bold text-4xl md:text-5xl mb-2 ${isDarkMode ? 'text-white' : 'text-navy-900'}`}>{stat.value}</div>
                                    <div className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</div>
                                </FadeInUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-24 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <FadeInUp>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Everything you need to run your school</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg">A complete suite of tools designed to make school administration effortless.</p>
                            </FadeInUp>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { icon: LayoutDashboard, title: "Dashboard", desc: "Real-time attendance overview, weekly analytics charts and key metrics at a glance." },
                                { icon: Users, title: "Teacher Management", desc: "Faculty profiles, subject assignments, and grade allocation in one unified view." },
                                { icon: School, title: "School Hub", desc: "School setup, grade & sections, subjects, and routine structure management." },
                                { icon: Calendar, title: "Academic Calendar", desc: "Schedule holidays, exams, and School events with automated reminders." },
                                { icon: Bell, title: "Announcements", desc: "School-wide notification dispatch system for students, parents, and staff." },
                                { icon: BookOpen, title: "Classroom", desc: "Student enrollment, class teacher assignment, and daily activity tracking." }
                            ].map((feature, i) => (
                                <FadeInUp key={i} delay={i * 0.1}>
                                    <div className="group bg-navy-800/50 border border-navy-700 rounded-2xl p-8 hover:bg-navy-800 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)] h-full">
                                        <div className="w-12 h-12 rounded-xl bg-navy-900 border border-navy-700 flex items-center justify-center mb-6 group-hover:border-emerald-500/50 group-hover:text-emerald-400 transition-colors">
                                            <feature.icon className="w-6 h-6 text-emerald-500" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold mb-3 text-white">{feature.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                                    </div>
                                </FadeInUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Product Preview */}
                <section className="py-24 px-6 bg-navy-800/20 border-y border-navy-700 overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col lg:flex-row items-center gap-16">
                            <div className="lg:w-1/3">
                                <FadeInUp>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Everything at a glance</h2>
                                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                                        Monitor attendance, grades, teachers, and events from a single, powerful dashboard. Designed for clarity and speed.
                                    </p>
                                    <ul className="space-y-4">
                                        {['Real-time attendance tracking', 'Interactive analytics charts', 'Quick action shortcuts'].map((item, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-300">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </FadeInUp>
                            </div>
                            <div className="lg:w-2/3 relative w-full">
                                <FadeInUp delay={0.2}>
                                    <div className="rounded-2xl border border-navy-700 bg-navy-900 shadow-2xl overflow-hidden flex w-full">
                                        {/* Sidebar */}
                                        <div className="w-48 border-r border-navy-700 bg-navy-800/50 p-4 hidden sm:block">
                                            <div className="flex items-center gap-2 mb-8 px-2">
                                                <GraduationCap className="w-6 h-6 text-emerald-400" />
                                                <span className="font-display font-bold text-sm">ClassTrack</span>
                                            </div>
                                            <div className="space-y-2">
                                                {['Dashboard', 'Students', 'Teachers', 'Classes', 'Calendar'].map((item, i) => (
                                                    <div key={i} className={`px-3 py-2 rounded-lg text-sm font-medium ${i === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-navy-700 hover:text-white'}`}>
                                                        {item}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Main Content */}
                                        <div className="flex-1 p-6">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="font-display font-bold text-lg">Attendance Overview</h3>
                                                <div className="px-3 py-1 rounded-md bg-navy-700 text-xs font-medium text-gray-300">This Week</div>
                                            </div>
                                            {/* Fake Chart */}
                                            <div className="h-48 flex items-end gap-2 sm:gap-4">
                                                {[60, 80, 40, 90, 70, 50, 85].map((height, i) => (
                                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            whileInView={{ height: `${height}%` }}
                                                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                                            className={`w-full rounded-t-sm ${i === 3 ? 'bg-emerald-400' : 'bg-navy-700'}`}
                                                        />
                                                        <span className="text-[10px] text-gray-500">{'SMTWTFS'[i]}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </FadeInUp>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section id="how-it-works" className="py-24 px-6 relative">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <FadeInUp>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Get started in minutes</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg">No complex onboarding. Just simple, intuitive setup.</p>
                            </FadeInUp>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 relative">
                            {/* Connecting line */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-navy-700 -translate-y-1/2 z-0" />

                            {[
                                { step: "01", title: "Set up your school", desc: "Create your school profile, define grades, and set up your academic year." },
                                { step: "02", title: "Add your people", desc: "Import or invite teachers, students, and assign them to classrooms." },
                                { step: "03", title: "Start tracking", desc: "Monitor attendance, manage exams, and send announcements instantly." }
                            ].map((item, i) => (
                                <FadeInUp key={i} delay={i * 0.2}>
                                    <div className="relative z-10 bg-navy-900 border border-navy-700 rounded-2xl p-8 text-center hover:border-emerald-500/50 transition-colors">
                                        <div className="w-16 h-16 mx-auto bg-navy-800 border border-navy-700 rounded-full flex items-center justify-center font-display font-bold text-2xl text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                                            {item.step}
                                        </div>
                                        <h3 className="text-xl font-display font-bold mb-3 text-white">{item.title}</h3>
                                        <p className="text-gray-400">{item.desc}</p>
                                    </div>
                                </FadeInUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial */}
                <section className="py-24 px-6 bg-navy-800/30 border-y border-navy-700">
                    <div className="max-w-4xl mx-auto text-center">
                        <FadeInUp>
                            <div className="flex justify-center gap-1 mb-8">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                            <blockquote className="text-2xl md:text-4xl font-display font-medium leading-tight mb-8 text-white">
                                "ClassTrack has completely transformed how we manage our academy. Handling 1,248 students used to be a logistical nightmare, but now it's effortless."
                            </blockquote>
                            <div className="flex items-center justify-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-navy-700 overflow-hidden">
                                    <div className="w-full h-full bg-navy-800 flex items-center justify-center border border-navy-700">
                                        <FaRegUser className="text-emerald-500 w-6 h-6" />
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-white">Florentino Perez</div>
                                    <div className="text-sm text-gray-400">Headmaster, Real Madrid Academy</div>
                                </div>
                            </div>
                        </FadeInUp>
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <FadeInUp>
                                <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Simple, transparent pricing</h2>
                                <p className="text-gray-400 max-w-2xl mx-auto text-lg">For schools of all sizes. No hidden fees.</p>
                            </FadeInUp>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {[
                                { name: "Starter", price: "Free", desc: "Perfect for small schools getting started.", features: ["Up to 100 students", "Basic attendance", "Teacher profiles", "Community support"], buttonText: "Get Started" },
                                { name: "Pro", price: "$299", period: "/mo", desc: "Everything you need for a growing school.", features: ["Up to 1,000 students", "Advanced analytics", "Parent portal", "Priority email support"], popular: true, disabled: true, buttonText: "Not Available Now" },
                                { name: "Enterprise", price: "Custom", desc: "Tailored solutions for large institutions.", features: ["Unlimited students", "Custom integrations", "Dedicated account manager", "24/7 phone support"], disabled: true, buttonText: "Upcoming" }
                            ].map((tier, i) => (
                                <FadeInUp key={i} delay={i * 0.1}>
                                    <div className={`relative bg-navy-800/50 border rounded-2xl p-8 h-full flex flex-col ${tier.popular ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-navy-700'}`}>
                                        {tier.popular && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-navy-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                                Most Popular
                                            </div>
                                        )}
                                        <h3 className="text-xl font-display font-bold mb-2 text-white">{tier.name}</h3>
                                        <p className="text-gray-400 text-sm mb-6">{tier.desc}</p>
                                        <div className="mb-8">
                                            <span className="text-4xl font-display font-bold text-white">{tier.price}</span>
                                            {tier.period && <span className="text-gray-400">{tier.period}</span>}
                                        </div>
                                        <ul className="space-y-4 mb-8 flex-1">
                                            {tier.features.map((feature, j) => (
                                                <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                                                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            disabled={tier.disabled}
                                            className={`w-full py-3 rounded-xl font-semibold transition-all ${tier.popular ? 'bg-emerald-500 hover:bg-emerald-400 text-navy-900' : 'bg-navy-700 hover:bg-navy-600 text-white'} ${tier.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {tier.buttonText}
                                        </button>
                                    </div>
                                </FadeInUp>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Footer Banner */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-emerald-500/5" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

                    <div className="max-w-4xl mx-auto text-center relative z-10 bg-navy-800/50 border border-navy-700 backdrop-blur-xl p-12 md:p-20 rounded-3xl">
                        <FadeInUp>
                            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">Ready to transform your school?</h2>
                            <p className="text-xl text-gray-400 mb-10">Join 50+ schools already using ClassTrack to streamline their operations.</p>
                            <button className="bg-emerald-500 hover:bg-emerald-400 text-navy-900 font-bold px-10 py-5 rounded-xl transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] text-lg">
                                Start Free Trial
                            </button>
                        </FadeInUp>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-navy-900 border-t border-navy-800 pt-16 pb-8 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <GraduationCap className="w-8 h-8 text-emerald-400" />
                                <span className="font-display font-bold text-2xl tracking-tight text-white">ClassTrack</span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-6">
                                The modern school operating system. Manage classrooms, teachers, and students in one unified platform.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Twitter className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Github className="w-5 h-5" /></a>
                                <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors"><Linkedin className="w-5 h-5" /></a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Community</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Help Center</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Legal</a></li>
                                <li><a href="#" className="hover:text-emerald-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-navy-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} ClassTrack. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm text-gray-500">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}