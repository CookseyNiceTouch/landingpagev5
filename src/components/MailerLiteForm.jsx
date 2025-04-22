import { useEffect } from 'react';
import './mailerLite.css';

const MailerLiteForm = () => {
  useEffect(() => {
    // Load MailerLite scripts
    const script = document.createElement('script');
    script.src = 'https://groot.mailerlite.com/js/w/webforms.min.js?v176e10baa5e7ed80d35ae235be3d5024';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Add success callback
      window.ml_webform_success_24164656 = function() {
        const successDiv = document.querySelector('.ml-subscribe-form-24164656 .row-success');
        const formDiv = document.querySelector('.ml-subscribe-form-24164656 .row-form');
        if (successDiv && formDiv) {
          successDiv.style.display = 'block';
          formDiv.style.display = 'none';
        }
      };

      // Initialize form
      fetch("https://assets.mailerlite.com/jsonp/1413791/forms/150028848308684795/takel");

      // Add app-button class to the button after form is loaded
      setTimeout(() => {
        const button = document.querySelector('.ml-form-horizontalRow button.primary');
        if (button) {
          button.classList.add('app-button');
        }
      }, 500);
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="signup-container">
      <div className="email-form-wrapper">
        <div id="mlb2-24164656" className="ml-form-embedContainer ml-subscribe-form ml-subscribe-form-24164656">
          <div className="ml-form-align-center">
            <div className="ml-form-embedWrapper embedForm">
              <div className="ml-form-embedBody ml-form-embedBodyHorizontal row-form">
                <form className="ml-block-form" action="https://assets.mailerlite.com/jsonp/1413791/forms/150028848308684795/subscribe" data-code="" method="post">
                  <div className="ml-form-formContent horozintalForm">
                    <div className="ml-form-horizontalRow">
                      <div className="ml-input-horizontal">
                        <div style={{ width: '100%' }} className="horizontal-fields">
                          <div className="ml-field-group ml-field-email ml-validate-email ml-validate-required">
                            <input type="email" className="form-control" name="fields[email]" placeholder="Email" autoComplete="email" />
                          </div>
                        </div>
                      </div>
                      <div className="ml-button-horizontal primary">
                        <button type="submit" className="primary app-button">Sign Up</button>
                        <button disabled style={{ display: 'none' }} type="button" className="loading">
                          <div className="ml-form-embedSubmitLoad"></div>
                          <span className="sr-only">Loading...</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <input type="hidden" name="ml-submit" value="1" />
                  <input type="hidden" name="anticsrf" value="true" />
                </form>
              </div>
              <div className="ml-form-successBody row-success" style={{ display: 'none' }}>
                <div className="ml-form-successContent">
                  <h4>Thanks for signing up, we'll be in touch soon!</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="discord-wrapper">
        <a href="https://discord.gg/jpp3mQUCYN" target="_blank" rel="noopener noreferrer" className="app-button discord-button">
          Join our Discord
        </a>
      </div>
    </div>
  );
};

export default MailerLiteForm; 