import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../contexts/AuthContext';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    question: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.question.trim()) {
      toast.error('Please complete all fields.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiCall('/contact/inquiry', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          question: formData.question.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Thanks! We will respond shortly.');
        setFormData({ name: '', email: '', question: '' });
        navigate('/');
      } else {
        throw new Error(data?.message || 'Failed to send your question.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send your question.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <header className="contact-header">
          <h1>Contact Us</h1>
          <p>Have a question about AOMTrading? Send us a quick note below.</p>
        </header>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Trader"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              name="question"
              rows={6}
              value={formData.question}
              onChange={handleChange}
              placeholder="How can we help?"
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
