import React from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Navbar } from "react-bootstrap";


export default function LandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div>
      <Navbar />
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary fixed-top shadow-sm">
        <div className="container">
          <a className="navbar-brand fw-bold" href="#hero">
            Smart Rentals
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#how">
                  How It Works
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#contact">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <a className="btn btn-warning ms-3" href="/login">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="hero d-flex align-items-center text-center text-white">
        <div className="container">
          <motion.h1
            className="display-4 fw-bold"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find & Manage Your Dream Home Easily
          </motion.h1>
          <motion.p
            className="lead mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Smart Rentals makes it simple to search, rent, and manage properties
            all in one place.
          </motion.p>
          <motion.a
            href="/register"
            className="btn btn-lg btn-warning mt-4 shadow-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            Get Started
          </motion.a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-5">
        <div className="container text-center">
          <motion.h2
            className="mb-5 fw-bold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            Our Features
          </motion.h2>
          <div className="row g-4">
            {[
              { icon: "bi-house-door-fill", title: "Property Search", text: "Browse through verified listings with detailed photos and descriptions." },
              { icon: "bi-cash-stack", title: "Online Payments", text: "Pay rent securely from anywhere with our integrated payment system." },
              { icon: "bi-tools", title: "Maintenance Requests", text: "Report and track maintenance issues directly from your dashboard." }
            ].map((f, idx) => (
              <motion.div
                className="col-md-4"
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
              >
                <div className="feature-card p-4 shadow-sm h-100">
                  <div className="feature-icon mb-3">
                    <i className={`bi ${f.icon}`}></i>
                  </div>
                  <h5>{f.title}</h5>
                  <p>{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-5 bg-light">
        <div className="container">
          <motion.h2
            className="text-center fw-bold mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            How It Works
          </motion.h2>
          <div className="row text-center g-4">
            {[
              { step: 1, title: "Sign Up", desc: "Create your account and set up your profile." },
              { step: 2, title: "Browse Homes", desc: "Search from a variety of available rental properties." },
              { step: 3, title: "Book & Pay", desc: "Reserve your property and make payments online." },
              { step: 4, title: "Manage Rentals", desc: "Track payments, requests, and rental history easily." }
            ].map((s, idx) => (
              <motion.div
                className="col-md-3"
                key={s.step}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
              >
                <span className="step-badge">{s.step}</span>
                <h6 className="mt-3">{s.title}</h6>
                <p>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5">
        <div className="container">
          <motion.h2
            className="text-center fw-bold mb-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            What Our Clients Say
          </motion.h2>
          <div className="row g-4">
            {[
              { text: "Smart Rentals helped me find my dream apartment in days. Highly recommended!", author: "Jane W." },
              { text: "Paying rent online has never been easier. Love the convenience.", author: "Michael K." },
              { text: "The maintenance request feature saved me so much hassle. Great platform!", author: "Sarah L." }
            ].map((t, idx) => (
              <motion.div
                className="col-md-4"
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: idx * 0.2 }}
              >
                <div className="testimonial shadow-sm">
                  <p>"{t.text}"</p>
                  <small>- {t.author}</small>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer text-center">
        <div className="container">
          <h5>Contact Us</h5>
          <p>Email: support@smartrentals.com | Phone: +254 700 123 456</p>
          <p className="mb-0">&copy; 2025 Smart Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
