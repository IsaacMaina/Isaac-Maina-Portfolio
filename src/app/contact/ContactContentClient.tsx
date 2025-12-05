// src/app/contact/ContactContentClient.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

interface Profile {
  name?: string;
  title?: string;
  email?: string;
  about?: string;
  location?: string;
  phone?: string;
  careerFocus?: string;
  image?: string;
}

interface ContactContentClientProps {
  profile: Profile;
}

export default function ContactContentClient({
  profile,
}: ContactContentClientProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Success message
      setSubmitMessage('Redirecting to WhatsApp...');

      // Redirect to WhatsApp with the pre-filled message
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank'); // Opens WhatsApp in a new tab
        setSubmitMessage('WhatsApp opened! Complete the message to send.');
      } else {
        // Fallback if no URL is returned
        setSubmitMessage('Message ready! Please open WhatsApp manually.');
      }

      setFormData({ name: '', email: '', message: '' });

      // Clear success message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitMessage('Failed to send message. Please try again or contact me directly.');

      // Clear error message after 5 seconds
      setTimeout(() => setSubmitMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Use the profile information or fallback to defaults
  const contactInfo = [
    {
      name: "Email",
      value: profile.email || "mainaisaacwachira2000@gmail.com",
      icon: "✉️",
      href: `mailto:${profile.email || "mainaisaacwachira2000@gmail.com"}`,
    },
    {
      name: "Phone",
      value: profile.phone || "+254758302725",
      icon: "📞",
      href: `tel:${profile.phone || "+254758302725"}`,
    },
  
    {
      name: "LinkedIn",
      value: "Isaac Maina",
      icon: "💼",
      href: "https://linkedin.com/in/isaac-maina",
    },
    {
      name: "GitHub",
      value: "IsaacMaina",
      icon: "💻",
      href: "https://github.com/IsaacMaina",
    },
    {
      name: "Twitter",
      value: "@DevIsaacMaina",
      icon: "🐦",
      href: "https://x.com/DevIsaacMaina",
    },
    {
      name: "Instagram",
      value: "@devisaacmaina",
      icon: "📸",
      href: "https://instagram.com/devisaacmaina",
    },
    {
      name: "Facebook",
      value: "Isaac Maina",
      icon: "📘",
      href: "https://web.facebook.com/profile.php?id=61576682944507",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection
          className="text-4xl font-bold mb-4 text-center"
          animationType="fade"
        >
          Get In <span className="text-accent-cyan">Touch</span>
        </AnimatedSection>

        <AnimatedSection
          className="text-xl text-slate-400 mb-12 text-center max-w-3xl mx-auto"
          animationType="fade"
          delay={0.1}
        >
          Have a project in mind or want to discuss potential opportunities?
          Feel free to reach out!
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <AnimatedSection animationType="slide-right" delay={0.2}>
            <motion.div
              className="card p-8 hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

              {submitMessage && (
                <motion.div
                  className="mb-6 p-4 bg-emerald-900/30 border border-emerald-700 rounded-lg text-emerald-400"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {submitMessage}
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="name" className="block text-slate-300 mb-2">
                    Name
                  </label>
                  <motion.input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan text-white transition-all duration-300"
                    placeholder="Your name"
                    whileFocus={{ scale: 1.01, borderColor: "#06b6d4" }}
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-slate-300 mb-2">
                    Email
                  </label>
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan text-white transition-all duration-300"
                    placeholder="your.email@example.com"
                    whileFocus={{ scale: 1.01, borderColor: "#06b6d4" }}
                  />
                </div>

                <div className="mb-6">
                  <label
                    htmlFor="message"
                    className="block text-slate-300 mb-2"
                  >
                    Message
                  </label>
                  <motion.textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-cyan text-white transition-all duration-300"
                    placeholder="Your message here..."
                    whileFocus={{ scale: 1.01, borderColor: "#06b6d4" }}
                  ></motion.textarea>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn btn-primary w-full ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>
          </AnimatedSection>

          {/* Contact Information */}
          <AnimatedSection animationType="slide-left" delay={0.2}>
            <motion.div
              className="card p-8 hover:shadow-2xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

              <div className="space-y-4">
                {contactInfo.map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.href}
                    target={
                      contact.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      contact.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="flex items-center p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                    whileHover={{ x: 5, backgroundColor: "#1e293b" }}
                    transition={{ duration: 0.2 }}
                  >
                    <span className="text-2xl mr-4">{contact.icon}</span>
                    <div>
                      <h3 className="font-semibold">{contact.name}</h3>
                      <p className="text-slate-400">{contact.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-bold mb-4">My Location</h3>
                <p className="text-slate-400">
                  {profile.location || "Nairobi, Kenya"}
                </p>

                {/* Interactive Map */}
                <motion.div
                  className="mt-6 rounded-xl overflow-hidden shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="aspect-w-16 aspect-h-9 relative h-64 w-full">
                    {/* Using Google Maps embedded view with dynamic location */}
                    <iframe
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(profile.location || 'Nairobi, Kenya')}&output=embed`}
                      width="100%"
                      height="100%"
                      className="border-0 rounded-lg w-full h-full"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Location Map"
                    ></iframe>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
