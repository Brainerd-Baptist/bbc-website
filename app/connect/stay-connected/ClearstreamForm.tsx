"use client";

import { useState } from "react";
import Script from "next/script";

// Clearstream's HTML embed, verbatim, minus their own <link> stylesheet and
// <script> tags (scripts are loaded separately below via next/script, in
// order, since form.html.js expects a global jQuery to already be present —
// see the load-order comment further down). Restyled entirely with our own
// CSS underneath so it matches the rest of the site instead of Clearstream's
// default look. If this ever needs to change (a different list, a new
// field), regenerate the embed code from the Clearstream dashboard for this
// form and swap the markup below, keeping the wrapping <script> logic as-is.
const FORM_HTML = `
<div class="cs_html_form_container">
    <h2>Brainerd Baptist Church Communications</h2>
    <p class="cs_html_form_subtitle">Fill out the form to receive church updates.</p>
    <form class="cs_html_form" action="https://opturl.com/h/MZPvWXwn" method="post" id="cs_html_form_MZPvWXwn" target="_blank">
        <div class="cs_html_form_result"></div>
        <div class="cs_html_form_error"></div>
        <div class="cs_html_form_row"><input type="text" name="mobile_number" placeholder="Mobile Number *" data-country="US"/></div>
        <div class="cs_html_form_row"><input type="text" name="first" placeholder="First Name"/></div>
        <div class="cs_html_form_row"><input type="text" name="last" placeholder="Last Name"/></div>
        <div class="cs_html_form_row"><input type="text" name="email" placeholder="Email Address *"/></div>
        <div class="cs_html_form_row">
            <p>Choose which list(s) to subscribe to:</p>
            <ul class="cs_html_form_lists">
                <li>Loading...</li>
            </ul>
        </div>
        <div class="cs_html_form_row">
            <button type="submit">Subscribe</button>
        </div>
        <p class="cs_html_form_terms">Message &amp; data rates may apply. Message frequency varies. <a href="https://clst.io/terms" target="_blank">Terms of Service</a> and <a href="https://clst.io/privacy" target="_blank">Privacy Policy</a>. To opt-out, text STOP at any time. <a href="https://clearstream.io" target="_blank">Church texting by Clearstream.</a></p>
    </form>
</div>
`;

export default function ClearstreamForm() {
  const [jqueryReady, setJqueryReady] = useState(false);

  return (
    <>
      <div className="bbc-cs-form" dangerouslySetInnerHTML={{ __html: FORM_HTML }} />

      {/* form.html.js expects a global jQuery to already exist on the page
          (it calls jQuery.noConflict in Clearstream's own snippet, which
          only makes sense if jQuery is already loaded) — load it first and
          only load their script once jQuery is confirmed ready. */}
      <Script
        src="https://code.jquery.com/jquery-3.7.1.min.js"
        strategy="afterInteractive"
        onLoad={() => setJqueryReady(true)}
      />
      {jqueryReady && (
        <Script src="https://app.clearstream.io/js/external/form.html.js" strategy="afterInteractive" />
      )}

      <style>{`
        .bbc-cs-form .cs_html_form_container h2,
        .bbc-cs-form .cs_html_form_subtitle {
          display: none;
        }
        .bbc-cs-form .cs_html_form_row {
          margin-bottom: 1rem;
        }
        .bbc-cs-form .cs_html_form_row p {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--fg);
          margin-bottom: 0.625rem;
        }
        .bbc-cs-form input[type="text"] {
          border: 1px solid var(--border-input);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          width: 100%;
          font-size: 0.875rem;
          color: var(--fg);
          background: var(--surface-raised);
          transition: box-shadow 0.15s, border-color 0.15s;
        }
        .bbc-cs-form input[type="text"]::placeholder {
          color: var(--fg-muted);
        }
        .bbc-cs-form input[type="text"]:focus {
          outline: none;
          border-color: transparent;
          box-shadow: 0 0 0 2px var(--focus-ring);
        }
        .bbc-cs-form .cs_html_form_lists {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem 1.25rem;
        }
        .bbc-cs-form .cs_html_form_lists li {
          font-size: 0.875rem;
          color: var(--fg);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .bbc-cs-form .cs_html_form_lists input[type="checkbox"] {
          accent-color: var(--accent);
          width: 1.05rem;
          height: 1.05rem;
          flex-shrink: 0;
        }
        .bbc-cs-form button[type="submit"] {
          width: 100%;
          font-family: inherit;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          font-size: 0.875rem;
          color: var(--fg-on-accent);
          background: var(--accent-solid);
          border: none;
          border-radius: 9999px;
          padding: 0.875rem 1.5rem;
          cursor: pointer;
          transition: background 0.15s;
        }
        .bbc-cs-form button[type="submit"]:hover {
          background: var(--accent-solid-hover);
        }
        .bbc-cs-form .cs_html_form_terms {
          font-size: 0.7rem;
          line-height: 1.5;
          color: var(--fg-muted);
          margin-top: 1.25rem;
        }
        .bbc-cs-form .cs_html_form_terms a {
          color: var(--fg-muted);
          text-decoration: underline;
        }
        .bbc-cs-form .cs_html_form_error:not(:empty) {
          color: #ef4444;
          font-size: 0.8rem;
          background: rgba(239,68,68,0.06);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1rem;
        }
        .bbc-cs-form .cs_html_form_result:not(:empty) {
          background: var(--accent-bg);
          border: 1px solid var(--accent);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          color: var(--fg);
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
}
