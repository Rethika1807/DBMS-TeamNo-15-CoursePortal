document.addEventListener('DOMContentLoaded', () => {
    
    // --- UTILITIES ---
    // Only keeping session info (id/name/email) securely in localStorage
    const getCurrentUser = () => JSON.parse(localStorage.getItem('currentUser'));
    const setCurrentUser = (user) => localStorage.setItem('currentUser', JSON.stringify(user));
    
    const API_URL = 'http://localhost:3000/api';

    // --- PAGE ROUTING / AUTH CHECKS ---
    const path = window.location.pathname;
    const isDashboard = path.includes('dashboard.html');
    const isAuthPage = path.includes('login.html') || path.includes('signup.html');

    const currentUser = getCurrentUser();

    if (isDashboard && !currentUser) {
        window.location.href = 'login.html';
        return;
    }

    if (isAuthPage && currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }

    // --- SIGNUP LOGIC ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value.trim();
            const email = document.getElementById('signupEmail').value.trim();
            const password = document.getElementById('signupPassword').value.trim();
            const errorDiv = document.getElementById('signupError');

            try {
                const response = await fetch(`${API_URL}/signup`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    errorDiv.textContent = data.error || 'Signup failed';
                    errorDiv.style.display = 'block';
                    return;
                }

                setCurrentUser(data.user);
                window.location.href = 'dashboard.html';
            } catch (err) {
                errorDiv.textContent = "Server error. Please try again later.";
                errorDiv.style.display = 'block';
            }
        });
    }

    // --- LOGIN LOGIC ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const errorDiv = document.getElementById('loginError');

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                
                if (!response.ok) {
                    errorDiv.textContent = data.error || 'Invalid credentials';
                    errorDiv.style.display = 'block';
                    return;
                }

                setCurrentUser(data.user);
                window.location.href = 'dashboard.html';
            } catch (err) {
                errorDiv.textContent = "Server error. Please try again later.";
                errorDiv.style.display = 'block';
            }
        });
    }

    // --- DASHBOARD LOGIC ---
    if (isDashboard) {
        // Setup User Info
        document.getElementById('sidebarUserName').textContent = currentUser.name;
        const initial = currentUser.name.charAt(0).toUpperCase();
        document.getElementById('sidebarAvatar').textContent = initial;
        document.getElementById('settingsAvatar').textContent = initial;
        document.getElementById('settingsName').textContent = currentUser.name;
        document.getElementById('settingsEmail').textContent = currentUser.email;
        document.getElementById('displaySettingsName').textContent = currentUser.name;
        document.getElementById('displaySettingsEmail').textContent = currentUser.email;

        // Sidebar Toggling
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const sidebar = document.querySelector('.sidebar');
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('show');
            });
        }

        // Tab Switching
        const navItems = document.querySelectorAll('.nav-item[data-target]');
        const tabPanes = document.querySelectorAll('.tab-pane');
        const pageTitle = document.getElementById('pageTitle');

        const switchTab = (targetId) => {
            navItems.forEach(nav => {
                nav.classList.remove('active');
                if (nav.dataset.target === targetId) {
                    nav.classList.add('active');
                    pageTitle.textContent = nav.textContent.trim();
                }
            });

            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');

            if (targetId === 'enrolled-courses') {
                renderEnrolledCourses();
            }

            if (window.innerWidth <= 768 && sidebar.classList.contains('show')) {
                sidebar.classList.remove('show');
            }
        };

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                switchTab(item.dataset.target);
            });
        });

        document.querySelectorAll('.switch-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchTab(btn.dataset.target);
            });
        });

        // --- ENROLLMENT LOGIC ---
        const enrollModal = document.getElementById('enrollModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const enrollmentForm = document.getElementById('enrollmentForm');
        
        document.querySelectorAll('.enroll-init-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const courseName = e.target.dataset.course;
                document.getElementById('modalCourseName').textContent = courseName;
                document.getElementById('enrollCourseHidden').value = courseName;
                
                // Auto-fill available user info
                document.getElementById('enrollName').value = currentUser.name;
                document.getElementById('enrollEmail').value = currentUser.email;
                document.getElementById('enrollPhone').value = '';
                document.getElementById('enrollError').style.display = 'none';
                
                enrollModal.classList.add('active');
            });
        });

        const closeModal = () => enrollModal.classList.remove('active');
        closeModalBtn.addEventListener('click', closeModal);
        enrollModal.addEventListener('click', (e) => {
            if (e.target === enrollModal) closeModal();
        });

        // Backend Driven Enrollment
        enrollmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const courseName = document.getElementById('enrollCourseHidden').value;
            const phone = document.getElementById('enrollPhone').value.trim();
            const errorDiv = document.getElementById('enrollError');

            try {
                const response = await fetch(`${API_URL}/enroll`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        userId: currentUser.id, 
                        courseName: courseName, 
                        phone: phone 
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    errorDiv.textContent = data.error || 'Failed to enroll';
                    errorDiv.style.display = 'block';
                    return;
                }
                
                closeModal();
                switchTab('enrolled-courses');
            } catch (err) {
                errorDiv.textContent = "Server error. Please try again later.";
                errorDiv.style.display = 'block';
            }
        });

        // --- RENDER ENROLLED COURSES ---
        const renderEnrolledCourses = async () => {
            const container = document.getElementById('enrolledListContainer');
            const emptyState = document.getElementById('emptyEnrollments');
            
            container.innerHTML = '<p style="text-align:center; padding: 2rem;">Loading your courses...</p>';
            emptyState.style.display = 'none';
            
            try {
                const response = await fetch(`${API_URL}/enrollments/${currentUser.id}`);
                const data = await response.json();
                
                const userEnrollments = data.enrollments || [];
                container.innerHTML = '';
                
                if (userEnrollments.length === 0) {
                    emptyState.style.display = 'block';
                    return;
                }
                
                userEnrollments.forEach(en => {
                    const card = document.createElement('div');
                    card.className = 'enrolled-card';
                    
                    // Format Date nicely
                    const formattedDate = new Date(en.date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'long', day: 'numeric'
                    });

                    card.innerHTML = `
                        <div class="enrolled-info">
                            <h3>${en.course_name}</h3>
                            <p>Enrolled on: ${formattedDate}</p>
                            <p style="margin-top: 4px; font-size: 0.8rem">Details: ${en.student_name} | ${en.phone}</p>
                        </div>
                    `;
                    container.appendChild(card);
                });
            } catch (err) {
                container.innerHTML = '<p class="text-danger" style="text-align:center; padding: 2rem;">Failed to load enrolled courses from the server.</p>';
            }
        };

        // Initialize state by fetching courses when dashboard loads
        renderEnrolledCourses();

        // --- LOGOUT LOGIC ---
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
});
