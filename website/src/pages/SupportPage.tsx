import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiCall } from '../contexts/AuthContext';
import './SupportPage.css';

type UrgencyLevel = 'Low' | 'Medium' | 'High';

const urgencyLevels: UrgencyLevel[] = ['Low', 'Medium', 'High'];

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    issue: '',
    urgency: 'Medium' as UrgencyLevel,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.issue.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiCall('/support/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          issue: formData.issue.trim(),
          urgency: formData.urgency,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Your support request has been sent.');
        setFormData({ name: '', email: '', issue: '', urgency: 'Medium' });
        navigate('/');
      } else {
        throw new Error(data?.message || 'Failed to send support request.');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send support request.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="support-page">
      <div className="support-container">
        <header className="support-header">
          <h1>Need Help?</h1>
          <p>Let us know what you’re experiencing and we’ll get back to you shortly.</p>
        </header>

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
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
          </div>

          <div className="form-group">
            <label htmlFor="urgency">Urgency</label>
            <select
              id="urgency"
              name="urgency"
              value={formData.urgency}
              onChange={handleChange}
            >
              {urgencyLevels.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="issue">Support Request</label>
            <textarea
              id="issue"
              name="issue"
              rows={6}
              value={formData.issue}
              onChange={handleChange}
              placeholder="Tell us how we can help..."
              required
            />
          </div>

          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Sending...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SupportPage;
