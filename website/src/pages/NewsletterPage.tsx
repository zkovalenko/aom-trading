import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './NewsletterPage.css';

const NewsletterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast.error('Please fill in your first name, last name, and email.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.message || 'Subscription failed.');
      }

      setSubmitted(true);
      toast.success(data.message || 'Thanks for subscribing!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to subscribe right now. Please try again later.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="newsletter-page">
      <div className="container">
        <header className="newsletter-header">
          <h1>Join Our Newsletter</h1>
          <p>
            Stay ahead of new tutorials, live sessions, product updates, and community events. We’ll only
            send actionable insights and important announcements.
          </p>
        </header>

        <div className="newsletter-content">
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="cta-button secondary" disabled={submitting}>
              {submitting ? 'Subscribing…' : 'Subscribe'}
            </button>
          </form>

          <aside className="newsletter-aside">
            {submitted ? (
              <div className="success-card">
                <h2>Welcome!</h2>
                <p>Thanks for subscribing. We’ll keep you in the loop with the latest AOMTrading updates.</p>
              </div>
            ) : (
              <div className="benefits-card">
                <h2>What you’ll get</h2>
                <ul>
                  <li>Trading room highlights and upcoming schedules.</li>
                  <li>Early access to software updates and feature drops.</li>
                  <li>Invites to special strategy sessions and workshops.</li>
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPage;
