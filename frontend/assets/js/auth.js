/**
 * FitTrack - Authentication Handler (auth.js)
 */

// Route Guard: Call on protected pages
function requireAuth() {
  const token = localStorage.getItem('fittrack_token');
  if (!token) {
    window.location.href = 'login.html';
  }
}

// Route Guard: Call on public auth pages (login, register)
function redirectIfAuth() {
  const token = localStorage.getItem('fittrack_token');
  if (token) {
    window.location.href = 'dashboard.html';
  }
}

// User Logout
function logoutUser() {
  localStorage.removeItem('fittrack_token');
  localStorage.removeItem('fittrack_user');
  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  // Login Form Handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      if (!email || !password) {
        showToast('Please enter both email and password.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Signing in...';

        const data = await apiRequest('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        if (data.token) {
          localStorage.setItem('fittrack_token', data.token);
          localStorage.setItem('fittrack_user', JSON.stringify(data.user));
          showToast('Welcome back to FitTrack!', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 600);
        } else {
          // Fallback demo login if mock was returned
          localStorage.setItem('fittrack_token', 'demo_token_123');
          localStorage.setItem('fittrack_user', JSON.stringify({ name: 'Demo Athlete', email }));
          window.location.href = 'dashboard.html';
        }
      } catch (err) {
        showToast(err.message || 'Login failed. Please verify credentials.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In to Account';
      }
    });
  }

  // Register Form Handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const confirmPassword = document.getElementById('regConfirmPassword').value;
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      if (password !== confirmPassword) {
        showToast('Passwords do not match.', 'error');
        return;
      }

      if (password.length < 6) {
        showToast('Password must be at least 6 characters long.', 'error');
        return;
      }

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Creating Account...';

        const data = await apiRequest('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });

        if (data.token) {
          localStorage.setItem('fittrack_token', data.token);
          localStorage.setItem('fittrack_user', JSON.stringify(data.user));
          showToast('Account created successfully!', 'success');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 600);
        } else {
          showToast('Account registered! Please log in.', 'success');
          window.location.href = 'login.html';
        }
      } catch (err) {
        showToast(err.message || 'Registration failed.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Free Account';
      }
    });
  }

  // Forgot Password Form Handler
  const forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgotEmail').value.trim();
      const submitBtn = forgotForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span> Generating Token...';

        const data = await apiRequest('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });

        showToast(data.message || 'Instructions sent to your email.', 'success');
        
        // Show reset token if provided for direct development testing
        if (data.resetToken) {
          const resetNotice = document.getElementById('resetTokenNotice');
          if (resetNotice) {
            resetNotice.innerHTML = `
              <div class="card" style="margin-top:1rem; border-color:var(--primary); text-align:left;">
                <p class="font-semibold text-primary">Development Reset Token Generated:</p>
                <code style="word-break:break-all; font-size:0.8rem;">${data.resetToken}</code>
                <p style="font-size:0.8rem; margin-top:0.5rem; color:var(--text-muted);">
                  Use this token with the password reset endpoint or contact admin.
                </p>
              </div>
            `;
          }
        }
      } catch (err) {
        showToast(err.message || 'Could not process request.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Request Reset Token';
      }
    });
  }
});
