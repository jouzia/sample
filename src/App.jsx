import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useSpring,
} from "framer-motion";

import {
    ArrowDown,
    ArrowUpRight,
    Check,
    ChevronDown,
    ExternalLink,
    FileBadge,
    Github,
    Linkedin,
    Mail,
    Menu,
    X,
} from "lucide-react";

import {
    profile,
    skills,
    projects,
    achievements,
    programs,
    certifications,
    stats,
} from "./data";

import { supabase } from "./lib/supabase";


// ============================================================
// MOTION SYSTEM
// ============================================================

const ease = [0.22, 1, 0.36, 1];

const reveal = {
    hidden: {
        opacity: 0,
        y: 35,
    },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.75,
            ease,
        },
    },
};

const stagger = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};


// ============================================================
// SMALL COMPONENTS
// ============================================================

function Eyebrow({ children, light = false }) {
    return (
        <div className={`eyebrow ${light ? "light" : ""}`}>
            <span className="eyebrow-line" />
            {children}
        </div>
    );
}


function SectionHeading({
    number,
    eyebrow,
    title,
    description,
    dark = false,
}) {
    return (
        <motion.div
            className={`section-heading ${dark ? "dark-heading" : ""}`}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
        >
            <Eyebrow light={dark}>
                {number} / {eyebrow}
            </Eyebrow>

            <h2 dangerouslySetInnerHTML={{ __html: title }} />

            {description && (
                <p>{description}</p>
            )}
        </motion.div>
    );
}


function MagneticButton({
    href,
    children,
    secondary = false,
    external = false,
}) {
    const [position, setPosition] = useState({
        x: 0,
        y: 0,
    });

    const handleMove = (event) => {
        const rect =
            event.currentTarget.getBoundingClientRect();

        const x =
            event.clientX -
            (rect.left + rect.width / 2);

        const y =
            event.clientY -
            (rect.top + rect.height / 2);

        setPosition({
            x: x * 0.12,
            y: y * 0.12,
        });
    };

    return (
        <motion.a
            href={href}
            className={`magnetic-btn ${secondary ? "secondary" : ""
                }`}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            onMouseMove={handleMove}
            onMouseLeave={() =>
                setPosition({ x: 0, y: 0 })
            }
            animate={position}
            transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
            }}
        >
            <span>{children}</span>
            <ArrowUpRight size={16} />
        </motion.a>
    );
}


function ParticleNetwork() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let width = 0;
        let height = 0;
        let points = [];
        let raf;
        const mouse = { x: -9999, y: -9999 };

        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        function resize() {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const density = window.innerWidth < 640 ? 16000 : 9000;
            const count = Math.min(90, Math.floor((width * height) / density));

            points = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
            }));
        }

        function step() {
            ctx.clearRect(0, 0, width, height);

            for (const p of points) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 110) {
                    const force = (110 - dist) / 110;
                    p.x += (dx / (dist || 1)) * force * 1.6;
                    p.y += (dy / (dist || 1)) * force * 1.6;
                }

                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                p.x = Math.max(0, Math.min(width, p.x));
                p.y = Math.max(0, Math.min(height, p.y));
            }

            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const a = points[i];
                    const b = points[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);

                    if (d < 130) {
                        ctx.strokeStyle = `rgba(92, 139, 247, ${(1 - d / 130) * 0.35})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = "rgba(180, 200, 255, 0.85)";
                ctx.beginPath();
                ctx.arc(points[i].x, points[i].y, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }

            raf = requestAnimationFrame(step);
        }

        function handleMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        }

        function handleMouseLeave() {
            mouse.x = -9999;
            mouse.y = -9999;
        }

        resize();
        step();

        window.addEventListener("resize", resize);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return <canvas className="particle-canvas" ref={canvasRef} />;
}


function Counter({ value }) {
    const numeric = parseInt(value, 10);
    const suffix = value.replace(/[0-9]/g, "");
    const [display, setDisplay] = useState(
        Number.isNaN(numeric) ? value : 0
    );
    const ref = useRef(null);
    const done = useRef(false);

    useEffect(() => {
        if (Number.isNaN(numeric) || !ref.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !done.current) {
                    done.current = true;
                    const duration = 900;
                    const start = performance.now();

                    function tick(now) {
                        const progress = Math.min(
                            1,
                            (now - start) / duration
                        );
                        setDisplay(
                            Math.floor(progress * numeric)
                        );
                        if (progress < 1) {
                            requestAnimationFrame(tick);
                        } else {
                            setDisplay(numeric);
                        }
                    }

                    requestAnimationFrame(tick);
                }
            },
            { threshold: 0.4 }
        );

        observer.observe(ref.current);
        return () => observer.disconnect();
    }, [numeric]);

    return (
        <b ref={ref}>
            {Number.isNaN(numeric)
                ? value
                : String(display).padStart(
                      value.replace(suffix, "").length,
                      "0"
                  ) + suffix}
        </b>
    );
}


function StatStrip() {
    return (
        <section className="stat-strip">
            <div className="wrap">
                {stats.map((stat) => (
                    <motion.div
                        className="stat-cell"
                        key={stat.label}
                        variants={reveal}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.4 }}
                    >
                        <Counter value={stat.value} />
                        <span>{stat.label}</span>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}


// ============================================================
// NAVIGATION
// ============================================================

function Nav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const links = [
        ["About", "about"],
        ["Work", "work"],
        ["Achievements", "achievements"],
        ["Certificates", "certifications"],
        ["Contact", "contact"],
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        window.addEventListener(
            "scroll",
            handleScroll,
            { passive: true }
        );

        return () =>
            window.removeEventListener(
                "scroll",
                handleScroll
            );
    }, []);

    useEffect(() => {
        document.body.style.overflow =
            open ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    return (
        <>
            <header
                className={`site-nav ${scrolled ? "is-scrolled" : ""
                    }`}
            >
                <a
                    href="#top"
                    className="nav-logo"
                    onClick={() => setOpen(false)}
                >
                    JOUZIA<span>.</span>
                </a>

                <nav className="desktop-links">
                    {links.map(([label, id]) => (
                        <a
                            href={`#${id}`}
                            key={id}
                        >
                            {label}
                        </a>
                    ))}
                </nav>

                <div className="nav-actions">
                    <a
                        href={profile.resume}
                        className="nav-resume"
                        target="_blank"
                        rel="noreferrer"
                    >
                        RESUME
                        <ArrowUpRight size={13} />
                    </a>

                    <button
                        className="menu-toggle"
                        onClick={() =>
                            setOpen((value) => !value)
                        }
                        aria-label="Toggle navigation"
                    >
                        {open ? (
                            <X size={21} />
                        ) : (
                            <Menu size={21} />
                        )}
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="mobile-menu"
                        initial={{
                            opacity: 0,
                            y: "-100%",
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            y: "-100%",
                        }}
                        transition={{
                            duration: 0.55,
                            ease,
                        }}
                    >
                        <div className="mobile-menu-inner">
                            <div className="mobile-menu-label">
                                NAVIGATION
                            </div>

                            {links.map(
                                ([label, id], index) => (
                                    <motion.a
                                        href={`#${id}`}
                                        key={id}
                                        onClick={() =>
                                            setOpen(false)
                                        }
                                        initial={{
                                            opacity: 0,
                                            x: -25,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        transition={{
                                            delay:
                                                0.08 *
                                                index,
                                            duration: 0.5,
                                            ease,
                                        }}
                                    >
                                        <span>
                                            0
                                            {index + 1}
                                        </span>
                                        {label}
                                        <ArrowUpRight
                                            size={20}
                                        />
                                    </motion.a>
                                )
                            )}

                            <a
                                href={profile.resume}
                                target="_blank"
                                rel="noreferrer"
                                className="mobile-resume"
                            >
                                DOWNLOAD RESUME
                                <ArrowUpRight
                                    size={18}
                                />
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}


// ============================================================
// HERO
// ============================================================

function Hero() {
    const [mouse, setMouse] = useState({
        x: 0,
        y: 0,
    });

    const handleMouseMove = (event) => {
        const rect =
            event.currentTarget.getBoundingClientRect();

        const x =
            (event.clientX - rect.left) /
            rect.width -
            0.5;

        const y =
            (event.clientY - rect.top) /
            rect.height -
            0.5;

        setMouse({
            x,
            y,
        });
    };

    return (
        <section
            className="hero-v2"
            id="top"
            onMouseMove={handleMouseMove}
        >
            <div className="hero-grid" />

            <ParticleNetwork />

            <motion.div
                className="hero-orb"
                animate={{
                    x: mouse.x * 70,
                    y: mouse.y * 70,
                }}
                transition={{
                    type: "spring",
                    stiffness: 45,
                    damping: 20,
                }}
            />

            <div className="hero-noise" />

            <div className="hero-content wrap">
                <motion.div
                    className="hero-meta"
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.15,
                        duration: 0.7,
                    }}
                >
                    <span className="availability">
                        <i />
                        AVAILABLE FOR OPPORTUNITIES
                    </span>

                    <span>
                        2026 — 27
                    </span>
                </motion.div>

                <motion.div
                    className="hero-kicker"
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.25,
                        duration: 0.7,
                    }}
                >
                    AI · SOFTWARE · DATA · DESIGN
                </motion.div>

                <motion.h1
                    style={{
                        x: mouse.x * 8,
                        y: mouse.y * 8,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 60,
                        damping: 20,
                    }}
                >
                    <span className="hero-line">
                        SHAIK
                    </span>

                    <span className="hero-line hero-outline">
                        JOUZIA
                    </span>

                    <span className="hero-line">
                        AFREEN H<span className="hero-dot">
                            .
                        </span>
                    </span>
                </motion.h1>

                <div className="hero-bottom">
                    <motion.p
                        className="hero-description"
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.65,
                            duration: 0.7,
                        }}
                    >
                        I’m a BCA student and builder
                        exploring the intersection of{" "}
                        <strong>
                            artificial intelligence,
                            software, data and creative
                            technology.
                        </strong>
                    </motion.p>

                    <motion.div
                        className="hero-buttons"
                        initial={{
                            opacity: 0,
                            y: 25,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                        }}
                        transition={{
                            delay: 0.8,
                            duration: 0.7,
                        }}
                    >
                        <MagneticButton href="#work">
                            EXPLORE MY WORK
                        </MagneticButton>

                        <MagneticButton
                            href="#contact"
                            secondary
                        >
                            LET'S CONNECT
                        </MagneticButton>
                    </motion.div>
                </div>

                <motion.div
                    className="hero-socials"
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    transition={{
                        delay: 1,
                        duration: 0.7,
                    }}
                >
                    <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Github size={16} />
                        GitHub
                    </a>

                    {profile.linkedin && (
                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Linkedin size={16} />
                            LinkedIn
                        </a>
                    )}

                    <a
                        href={`mailto:${profile.email}`}
                    >
                        <Mail size={16} />
                        Email
                    </a>
                </motion.div>
            </div>

            <motion.a
                href="#about"
                className="hero-scroll"
                animate={{
                    y: [0, 8, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <span>SCROLL TO EXPLORE</span>
                <ArrowDown size={16} />
            </motion.a>
        </section>
    );
}


// ============================================================
// ABOUT
// ============================================================

function About() {
    return (
        <section
            className="section about-section"
            id="about"
        >
            <div className="wrap">
                <SectionHeading
                    number="01"
                    eyebrow="ABOUT"
                    title={
                        "BUILDING WITH <span>CURIOUSITY.</span>"
                    }
                    description="A BCA student graduating in 2027, learning by building real projects and experimenting across AI, software, data and design."
                />

                <div className="about-layout">
                    <motion.div
                        className="about-main"
                        variants={reveal}
                        initial="hidden"
                        whileInView="show"
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                    >
                        <span className="about-index">
                            01
                        </span>

                        <p className="about-statement">
                            I don't just want to{" "}
                            <em>learn technology.</em>
                            <br />
                            I want to understand it by
                            building with it.
                        </p>

                        <p>
                            My interests sit across
                            Generative AI, frontend
                            development, Python, data
                            visualization and product
                            building.
                        </p>

                        <p>
                            Every project is an opportunity
                            to move from an idea to
                            something tangible, useful and
                            interactive.
                        </p>
                    </motion.div>

                    <motion.div
                        className="about-profile"
                        variants={reveal}
                        initial="hidden"
                        whileInView="show"
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                    >
                        <div className="profile-row">
                            <span>EDUCATION</span>
                            <b>BCA</b>
                        </div>

                        <div className="profile-row">
                            <span>COLLEGE</span>
                            <b>
                                St. Joseph's College
                            </b>
                        </div>

                        <div className="profile-row">
                            <span>GRADUATION</span>
                            <b>2027</b>
                        </div>

                        <div className="profile-row">
                            <span>FOCUS</span>
                            <b>
                                AI / SOFTWARE / DATA
                            </b>
                        </div>

                        <div className="profile-row">
                            <span>BASED IN</span>
                            <b>INDIA</b>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


// ============================================================
// SKILLS
// ============================================================

function Skills() {
    return (
        <section
            className="section skills-section dark-section"
            id="skills"
        >
            <div className="wrap">
                <SectionHeading
                    number="02"
                    eyebrow="CAPABILITIES"
                    dark
                    title={
                        "THE TOOLS I <span>BUILD WITH.</span>"
                    }
                    description="A practical technology stack shaped by projects, experimentation and continuous learning."
                />

                <motion.div
                    className="skills-grid-v2"
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                >
                    {skills.map(
                        ([title, items], index) => (
                            <motion.article
                                className="skill-card-v2"
                                key={title}
                                variants={reveal}
                            >
                                <div className="skill-number">
                                    0{index + 1}
                                </div>

                                <div className="skill-card-heading">
                                    <h3>{title}</h3>
                                    <ArrowUpRight
                                        size={19}
                                    />
                                </div>

                                <div className="skill-items">
                                    {items.map((item) => (
                                        <span key={item}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </motion.article>
                        )
                    )}
                </motion.div>
            </div>
        </section>
    );
}


// ============================================================
// PROJECT CARD
// ============================================================

function ProjectCard({
    project,
    index,
}) {
    const [hovered, setHovered] =
        useState(false);

    const [pointer, setPointer] = useState({
        x: 50,
        y: 50,
    });

    const handlePointer = (event) => {
        const rect =
            event.currentTarget.getBoundingClientRect();

        setPointer({
            x:
                ((event.clientX - rect.left) /
                    rect.width) *
                100,
            y:
                ((event.clientY - rect.top) /
                    rect.height) *
                100,
        });
    };

    return (
        <motion.article
            className={`project-card-v2 ${index % 2
                ? "project-card-reverse"
                : ""
                }`}
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{
                once: true,
                amount: 0.15,
            }}
        >
            <motion.div
                className="project-visual-v2"
                onMouseEnter={() =>
                    setHovered(true)
                }
                onMouseLeave={() =>
                    setHovered(false)
                }
                onMouseMove={handlePointer}
                style={{
                    "--pointer-x": `${pointer.x}%`,
                    "--pointer-y": `${pointer.y}%`,
                }}
            >
                {project.image ? (
                    <motion.img
                        src={project.image}
                        alt={project.title}
                        animate={{
                            scale: hovered ? 1.045 : 1,
                        }}
                        transition={{
                            duration: 0.65,
                            ease,
                        }}
                    />
                ) : (
                    <div className="project-placeholder">
                        <span>
                            {project.title
                                .split(" ")
                                .slice(0, 2)
                                .join(" ")}
                        </span>
                    </div>
                )}

                <div className="project-visual-grid" />

                <div className="project-visual-top">
                    <span>
                        PROJECT {project.num}
                    </span>

                    <span>
                        {project.category}
                    </span>
                </div>

                <motion.div
                    className="project-view-circle"
                    animate={{
                        opacity: hovered
                            ? 1
                            : 0,
                        scale: hovered
                            ? 1
                            : 0.7,
                    }}
                    transition={{
                        duration: 0.3,
                    }}
                >
                    VIEW
                    <ArrowUpRight size={19} />
                </motion.div>

                <div className="project-pointer-light" />
            </motion.div>

            <div className="project-info-v2">
                <div className="project-info-number">
                    {String(index + 1).padStart(
                        2,
                        "0"
                    )}
                </div>

                <div className="project-info-main">
                    <div className="project-type">
                        {project.category}
                    </div>

                    <h3>{project.title}</h3>

                    <p>
                        {project.description}
                    </p>

                    <div className="project-tech">
                        {project.tags.map(
                            (tag) => (
                                <span key={tag}>
                                    {tag}
                                </span>
                            )
                        )}
                    </div>

                    <div className="project-links">
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Github
                                    size={15}
                                />
                                SOURCE
                                <ArrowUpRight
                                    size={14}
                                />
                            </a>
                        )}

                        {project.live && (
                            <a
                                href={project.live}
                                target="_blank"
                                rel="noreferrer"
                            >
                                LIVE PROJECT
                                <ExternalLink
                                    size={14}
                                />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </motion.article>
    );
}


// ============================================================
// PROJECTS
// ============================================================

function Projects() {
    return (
        <section
            className="section projects-section-v2"
            id="work"
        >
            <div className="wrap">
                <SectionHeading
                    number="03"
                    eyebrow="SELECTED WORK"
                    title={
                        "IDEAS, <span>BUILT.</span>"
                    }
                    description="A selection of projects spanning AI, software, data and frontend experiences."
                />

                <div className="projects-intro-v2">
                    <span>
                        {String(
                            projects.length
                        ).padStart(2, "0")}{" "}
                        BUILDS
                    </span>

                    <span>
                        SELECTED PROJECTS
                    </span>
                </div>

                <div className="projects-list-v2">
                    {projects.map(
                        (project, index) => (
                            <ProjectCard
                                project={project}
                                index={index}
                                key={
                                    project.id ||
                                    project.title
                                }
                            />
                        )
                    )}
                </div>
            </div>
        </section>
    );
}


// ============================================================
// ACHIEVEMENTS
// ============================================================

function Achievements() {
    return (
        <section
            className="section dark-section achievements-section"
            id="achievements"
        >
            <div className="wrap">
                <SectionHeading
                    number="04"
                    eyebrow="BEYOND COURSEWORK"
                    dark
                    title={
                        "LEARNING IN <span>PUBLIC.</span>"
                    }
                    description="Programs, challenges, communities and experiences that have pushed me beyond the classroom."
                />

                <div className="achievement-layout">
                    <div className="achievement-timeline">
                        {achievements.map(
                            (item, index) => (
                                <motion.article
                                    className="achievement-item"
                                    key={
                                        item.title
                                    }
                                    variants={
                                        reveal
                                    }
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{
                                        once: true,
                                        amount: 0.2,
                                    }}
                                >
                                    <div className="achievement-marker">
                                        <span />
                                    </div>

                                    <div className="achievement-content">
                                        <div className="achievement-meta">
                                            <span>
                                                {
                                                    item.date
                                                }
                                            </span>

                                            <span>
                                                {
                                                    item.status
                                                }
                                            </span>
                                        </div>

                                        <h3>
                                            {
                                                item.title
                                            }
                                        </h3>

                                        <strong>
                                            {item.org}
                                        </strong>

                                        <p>
                                            {
                                                item.description
                                            }
                                        </p>
                                    </div>
                                </motion.article>
                            )
                        )}
                    </div>

                    <div className="program-list">
                        <div className="program-list-heading">
                            <span>
                                SELECTED PROGRAMS
                            </span>
                        </div>

                        {programs.map(
                            (
                                [
                                    name,
                                    type,
                                    status,
                                ],
                                index
                            ) => (
                                <motion.div
                                    className="program-row-v2"
                                    key={name}
                                    variants={
                                        reveal
                                    }
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={{
                                        once: true,
                                    }}
                                >
                                    <span>
                                        0
                                        {index +
                                            1}
                                    </span>

                                    <div>
                                        <small>
                                            {
                                                type
                                            }
                                        </small>

                                        <h3>
                                            {name}
                                        </h3>
                                    </div>

                                    <b>
                                        {status}
                                    </b>
                                </motion.div>
                            )
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}


// ============================================================
// CERTIFICATES
// ============================================================

function CertificateCard({
    certificate,
    index,
}) {
    const [
        title,
        organization,
        category,
    ] = certificate;

    return (
        <motion.article
            className="certificate-card-v2"
            variants={reveal}
            whileHover={{
                y: -8,
            }}
            transition={{
                duration: 0.3,
                ease,
            }}
        >
            <div className="certificate-top">
                <span>
                    {String(index + 1).padStart(
                        2,
                        "0"
                    )}
                </span>

                <FileBadge size={21} />
            </div>

            <div className="certificate-body">
                <small>{category}</small>

                <h3>{title}</h3>

                <p>{organization}</p>
            </div>

            <button
                className="certificate-link"
                type="button"
            >
                VIEW CREDENTIAL
                <ArrowUpRight size={14} />
            </button>
        </motion.article>
    );
}


function Certifications() {
    const categories = useMemo(
        () => [
            "All",
            "AI",
            "Development",
            "Data",
            "Design",
            "Professional",
        ],
        []
    );

    const [filter, setFilter] =
        useState("All");

    const filtered = useMemo(() => {
        if (filter === "All") {
            return certifications;
        }

        return certifications.filter(
            ([, , category]) =>
                category === filter
        );
    }, [filter]);

    return (
        <section
            className="section certificates-section"
            id="certifications"
        >
            <div className="wrap">
                <SectionHeading
                    number="05"
                    eyebrow="CREDENTIALS"
                    title={
                        "LEARNING, <span>DOCUMENTED.</span>"
                    }
                    description="A growing archive of structured learning across technology, AI, development, data and design."
                />

                <div className="certificate-controls">
                    <div>
                        <span>
                            FILTER CERTIFICATES
                        </span>
                    </div>

                    <div className="certificate-filters">
                        {categories.map(
                            (category) => (
                                <button
                                    key={
                                        category
                                    }
                                    className={
                                        filter ===
                                            category
                                            ? "active"
                                            : ""
                                    }
                                    onClick={() =>
                                        setFilter(
                                            category
                                        )
                                    }
                                >
                                    {
                                        category
                                    }
                                </button>
                            )
                        )}
                    </div>
                </div>

                <motion.div
                    className="certificate-grid-v2"
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                        once: true,
                        amount: 0.1,
                    }}
                    key={filter}
                >
                    {filtered.map(
                        (
                            certificate,
                            index
                        ) => (
                            <CertificateCard
                                key={`${certificate[0]}-${index}`}
                                certificate={
                                    certificate
                                }
                                index={
                                    index
                                }
                            />
                        )
                    )}
                </motion.div>
            </div>
        </section>
    );
}


// ============================================================
// GITHUB
// ============================================================

function GithubSection() {
    return (
        <section className="github-section dark-section">
            <div className="wrap">
                <motion.a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="github-block"
                    variants={reveal}
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                        once: true,
                        amount: 0.2,
                    }}
                    whileHover={{
                        y: -5,
                    }}
                >
                    <div className="github-icon">
                        <Github size={31} />
                    </div>

                    <div className="github-copy">
                        <span>
                            06 / OPEN SOURCE
                        </span>

                        <h2>
                            THE PORTFOLIO IS
                            ONLY THE SURFACE.
                        </h2>

                        <p>
                            Explore the repositories,
                            experiments and source code
                            behind the work.
                        </p>
                    </div>

                    <div className="github-arrow">
                        <ArrowUpRight size={28} />
                    </div>
                </motion.a>
            </div>
        </section>
    );
}


// ============================================================
// EXPLORING
// ============================================================

function Exploring() {
    const items = [
        "Generative AI",
        "AI-powered Applications",
        "Data Science & Analytics",
        "Modern React Development",
        "Developer Communities",
        "Building Products from Ideas",
    ];

    return (
        <section
            className="section exploring-section"
        >
            <div className="wrap">
                <SectionHeading
                    number="07"
                    eyebrow="CURRENTLY EXPLORING"
                    title={
                        "STAYING <span>CURIOUS.</span>"
                    }
                    description="The questions and technologies currently shaping what I build next."
                />

                <div className="exploring-list">
                    {items.map(
                        (item, index) => (
                            <motion.div
                                className="exploring-row"
                                key={item}
                                variants={reveal}
                                initial="hidden"
                                whileInView="show"
                                viewport={{
                                    once: true,
                                    amount: 0.2,
                                }}
                                whileHover={{
                                    x: 10,
                                }}
                            >
                                <span>
                                    0
                                    {index + 1}
                                </span>

                                <h3>{item}</h3>

                                <ArrowUpRight
                                    size={20}
                                />
                            </motion.div>
                        )
                    )}
                </div>
            </div>
        </section>
    );
}


// ============================================================
// CONTACT
// ============================================================

function Contact() {
    return (
        <section
            className="contact-section"
            id="contact"
        >
            <div className="contact-grid-bg" />

            <div className="wrap">
                <motion.div
                    className="contact-content"
                    variants={reveal}
                    initial="hidden"
                    whileInView="show"
                    viewport={{
                        once: true,
                        amount: 0.2,
                    }}
                >
                    <Eyebrow>
                        08 / CONTACT
                    </Eyebrow>

                    <h2>
                        LET'S BUILD
                        <br />
                        <span>
                            SOMETHING.
                        </span>
                    </h2>

                    <p>
                        Have an opportunity, project,
                        collaboration, or simply want to
                        connect?
                    </p>

                    <div className="contact-actions">
                        <MagneticButton
                            href={`mailto:${profile.email}`}
                        >
                            START A CONVERSATION
                        </MagneticButton>
                    </div>

                    <div className="contact-links-v2">
                        <a
                            href={`mailto:${profile.email}`}
                        >
                            <Mail size={17} />
                            <span>
                                {profile.email}
                            </span>
                            <ArrowUpRight
                                size={15}
                            />
                        </a>

                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Github size={17} />
                            <span>
                                GitHub
                            </span>
                            <ArrowUpRight
                                size={15}
                            />
                        </a>

                        {profile.linkedin && (
                            <a
                                href={
                                    profile.linkedin
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Linkedin
                                    size={17}
                                />
                                <span>
                                    LinkedIn
                                </span>
                                <ArrowUpRight
                                    size={15}
                                />
                            </a>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}


// ============================================================
// FOOTER
// ============================================================

function Footer() {
    return (
        <footer className="site-footer">
            <div className="wrap footer-inner">
                <div className="footer-brand">
                    <strong>
                        SHAIK JOUZIA AFREEN H
                    </strong>

                    <span>
                        BCA · 2027
                    </span>
                </div>

                <div className="footer-links">
                    <a
                        href="#top"
                    >
                        BACK TO TOP
                        <ArrowUpRight
                            size={13}
                        />
                    </a>

                    <a
                        href={profile.github}
                        target="_blank"
                        rel="noreferrer"
                    >
                        GITHUB
                    </a>

                    {profile.linkedin && (
                        <a
                            href={
                                profile.linkedin
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            LINKEDIN
                        </a>
                    )}

                    <a
                        href={`mailto:${profile.email}`}
                    >
                        EMAIL
                    </a>
                </div>

                <small>
                    © {new Date().getFullYear()}{" "}
                    Jouzia. Built with curiosity.
                </small>
            </div>
        </footer>
    );
}


// ============================================================
// APP
// ============================================================

export default function App() {
    const { scrollYProgress } =
        useScroll();

    const progress = useSpring(
        scrollYProgress,
        {
            stiffness: 100,
            damping: 30,
            restDelta: 0.001,
        }
    );

    return (
        <>
            {/* GLOBAL SCROLL PROGRESS */}
            <motion.div
                className="scroll-progress"
                style={{
                    scaleX: progress,
                    transformOrigin:
                        "0%",
                }}
            />

            <Nav />

            <main>
                <Hero />

                <StatStrip />

                <About />

                <Skills />

                <Projects />

                <Achievements />

                <Certifications />

                <GithubSection />

                <Exploring />

                <Contact />
            </main>

            <Footer />
        </>
    );
}