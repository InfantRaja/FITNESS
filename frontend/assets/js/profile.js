/**
 * FitTrack - User Profile & Settings Logic (profile.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  setupProfileForms();
});

async function loadUserProfile() {
  try {
    const res = await apiRequest('/auth/me');
    const user = res.user;

    if (!user) return;

    // Prepopulate Profile Inputs
    if (document.getElementById('profileName')) document.getElementById('profileName').value = user.name || '';
    if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = user.email || '';
    if (document.getElementById('profileAge')) document.getElementById('profileAge').value = user.age || '';
    if (document.getElementById('profileGender')) document.getElementById('profileGender').value = user.gender || 'prefer_not_to_say';
    if (document.getElementById('profileHeight')) document.getElementById('profileHeight').value = user.height || '';
    if (document.getElementById('profileTargetWeight')) document.getElementById('profileTargetWeight').value = user.targetWeight || '';
    if (document.getElementById('profileCalorieTarget')) document.getElementById('profileCalorieTarget').value = user.dailyCalorieTarget || 2000;
    if (document.getElementById('profileWaterTarget')) document.getElementById('profileWaterTarget').value = user.dailyWaterTarget || 2500;

    // Update Local Storage
    localStorage.setItem('fittrack_user', JSON.stringify(user));
  } catch (err) {
    console.error('Error loading profile:', err);
  }
}

function setupProfileForms() {
  // Update Profile Form
  const profileForm = document.getElementById('updateProfileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const payload = {
        name: document.getElementById('profileName').value.trim(),
        age: Number(document.getElementById('profileAge').value) || null,
        gender: document.getElementById('profileGender').value,
        height: Number(document.getElementById('profileHeight').value) || null,
        targetWeight: Number(document.getElementById('profileTargetWeight').value) || null,
        dailyCalorieTarget: Number(document.getElementById('profileCalorieTarget').value) || 2000,
        dailyWaterTarget: Number(document.getElementById('profileWaterTarget').value) || 2500,
      };

      try {
        const res = await apiRequest('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        localStorage.setItem('fittrack_user', JSON.stringify(res.user));
        showToast('Profile and preferences updated!', 'success');
        initUserBadge();
      } catch (err) {
        showToast(err.message || 'Failed to update profile.', 'error');
      }
    });
  }

  // Change Password Form
  const passwordForm = document.getElementById('changePasswordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;

      if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match.', 'error');
        return;
      }

      try {
        await apiRequest('/auth/change-password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword }),
        });

        showToast('Password changed successfully!', 'success');
        passwordForm.reset();
      } catch (err) {
        showToast(err.message || 'Error changing password.', 'error');
      }
    });
  }
}
