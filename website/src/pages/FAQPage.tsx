import React from 'react';
import './FAQPage.css';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Where can I get a free Renko Bar?',
    answer: (
      <p>
        We recommend the free indicators at{' '}
        <a href="https://ninza.co" target="_blank" rel="noopener noreferrer">
          ninZa.co
        </a>
        . After signing in, you can download and load the ninZaRenko Bar into your platform.
      </p>
    ),
  },
  {
    question: 'What makes the Wave concept special?',
    answer: (
      <>
        <p>It keeps trading simple.</p>
        <ul>
          <li>If the Wave is bullish, we only take long trades.</li>
          <li>If the Wave is bearish, we only take short trades.</li>
        </ul>
        <p>By sticking to one side of the market, traders can avoid unnecessary risk.</p>
      </>
    ),
  },
  {
    question: 'Why do you use three timeframes (LTF, ATF, ETF)?',
    answer: (
      <>
        <p>You don’t always need three.</p>
        <ul>
          <li>Swing traders often do well with just two.</li>
          <li>The exact setup depends on your style and risk tolerance.</li>
        </ul>
        <p>
          Paid subscribers get our recommended timeframe settings tailored to different trading approaches.
        </p>
      </>
    ),
  },
  {
    question: 'What are your favorite setups?',
    answer: (
      <>
        <p>
          We don’t rely on a single “favorite.” Instead, we use three setups based on Wave formation:
        </p>
        <ul>
          <li>Wave beginnings – often the most rewarding (over 5:1 reward-to-risk).</li>
          <li>Wave reversals – also very profitable.</li>
          <li>Wave expansions – used carefully depending on market conditions.</li>
        </ul>
      </>
    ),
  },
  {
    question: 'Do you use lagging indicators?',
    answer: (
      <>
        <p>Almost never. We trade using pure price action and volume profile.</p>
        <p>
          The only exception: in the execution timeframe, we may use one lagging indicator to help
          confirm momentum shifts.
        </p>
      </>
    ),
  },
  {
    question: 'What intraday charts do you recommend?',
    answer: (
      <ul>
        <li>Futures → Renko Bars</li>
        <li>Stocks & ETFs → Range Bars</li>
      </ul>
    ),
  },
  {
    question: 'Do you scalp, day trade, or swing trade?',
    answer: (
      <>
        <p>We don’t recommend scalping — our research shows it doesn’t consistently work long-term.</p>
        <p>Most of our trades are swing trades, which we’ve found to be the most reliable.</p>
      </>
    ),
  },
  {
    question: 'What are “swing lows” and “swing highs”?',
    answer: (
      <>
        <p>They’re points in market structure that mark local turning points.</p>
        <p>
          Our method identifies these swings and applies filters to avoid “nested” or false swings.
        </p>
      </>
    ),
  },
  {
    question: 'How many monitors do you use?',
    answer: (
      <p>We currently use four, but honestly, one monitor is enough to trade successfully.</p>
    ),
  },
  {
    question: 'Why do you trade MNQ and MES instead of NQ and ES?',
    answer: (
      <p>
        Because most retail traders start with smaller accounts. MNQ and MES require less capital, making
        them more accessible while still providing great opportunities.
      </p>
    ),
  },
  {
    question: 'Where can I find daily economic data (like FOMC meetings, jobless claims, housing starts)?',
    answer: (
      <p>
        You can check the daily calendar here:{' '}
        <a href="https://us.econoday.com/" target="_blank" rel="noopener noreferrer">
          Econoday
        </a>
        .
      </p>
    ),
  },
  {
    question: 'Do you have a stock scanner?',
    answer: (
      <p>
        Yes, we use a proprietary scanner during our classes to spot opportunities. It’s not public yet,
        but we’re considering adding it to our product line.
      </p>
    ),
  },
];

const FAQPage: React.FC = () => {
  return (
    <div className="faq-page">
      <div className="container">
        <header className="faq-header">
          <h1>AOMTrading – Frequently Asked Questions</h1>
          <p>
            Answers to the questions we hear most from traders getting started with the AOM methodology.
            Have something else on your mind? <Link to="/contact">Reach out</Link> to our team anytime.
          </p>
        </header>

        <div className="faq-grid">
          {faqs.map(({ question, answer }) => (
            <article key={question} className="faq-card">
              <h2>{question}</h2>
              <div className="faq-answer">{answer}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
