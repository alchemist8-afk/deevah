// ========== SMOOTH SIDEBAR TOGGLE SYSTEM ==========
let isSidebarAnimating = false;
const SIDEBAR_ANIMATION_DURATION = 400; // Match CSS transition

function toggleSidebar() {
  if (isSidebarAnimating) return;
  
  const sidebar = document.getElementById('sidebar');
  const body = document.body;
  const html = document.documentElement;
  
  isSidebarAnimating = true;
  
  if (!sidebar.classList.contains('active')) {
    // Opening sequence
    sidebar.style.transition = `transform ${SIDEBAR_ANIMATION_DURATION}ms cubic-bezier(0.22, 0.61, 0.36, 1)`;
    sidebar.classList.add('active');
    body.classList.add('sidebar-active');
    html.style.scrollBehavior = 'auto';
  } else {
    // Closing sequence
    sidebar.style.transition = `transform ${SIDEBAR_ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    sidebar.classList.remove('active');
    body.classList.remove('sidebar-active');
    html.style.scrollBehavior = 'smooth';
  }

  setTimeout(() => {
    isSidebarAnimating = false;
  }, SIDEBAR_ANIMATION_DURATION);
}

// ========== SERVICE HUB SYSTEM ==========
function setupServiceHubs() {
  // Mobile submenu toggle
  document.querySelectorAll('.has-submenu > a').forEach(item => {
    item.addEventListener('click', function(e) {
      if (window.innerWidth < 769) {
        e.preventDefault();
        this.parentElement.classList.toggle('submenu-active');
      }
    }, { passive: false });
  });

  // URL hash detection
  function showHubFromHash() {
    const hash = window.location.hash.substring(1);
    if (!hash) return;
    
    document.querySelectorAll('.service-hub').forEach(hub => {
      hub.classList.remove('active');
    });
    
    const targetHub = document.getElementById(hash);
    if (targetHub) {
      targetHub.classList.add('active');
      // Smooth scroll to hub
      requestAnimationFrame(() => {
        targetHub.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  // Initialize hubs
  window.addEventListener('load', showHubFromHash, { passive: true });
  window.addEventListener('hashchange', showHubFromHash, { passive: true });

  // Close sidebar on mobile nav
  document.querySelectorAll('.nav-links a:not(.has-submenu > a)').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 769) {
        toggleSidebar();
      }
    }, { passive: true });
  });
}
// Toggle services dropdown
document.querySelector('.services-dropdown').addEventListener('click', function(e) {
  e.preventDefault();
  this.classList.toggle('active');
});

// Show service hub when link clicked
document.querySelectorAll('.services-submenu a').forEach(link => {
  link.addEventListener('click', function(e) {
    // Hide all hubs first
    document.querySelectorAll('.service-hub').forEach(hub => {
      hub.classList.remove('active');
    });
    
    // Show selected hub
    const targetHub = document.querySelector(this.getAttribute('href'));
    if(targetHub) targetHub.classList.add('active');
    
    // Close sidebar on mobile
    if(window.innerWidth < 768) {
      document.getElementById('sidebar').classList.remove('active');
    }
  });
});
// ========== WAITLIST FORM HANDLER ==========
function setupWaitlistForm() {
  const form = document.getElementById('waitlist-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[type="email"]');
    const email = emailInput.value.trim();

    if (!email) {
      showToast('Please enter a valid email');
      return;
    }

    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast('🎉 You\'ve been added to the waitlist!');
      form.reset();
    } catch (error) {
      showToast('⚠️ Error submitting form. Please try again.');
    }
  }, { passive: false });
}

// ========== UTILITY FUNCTIONS ==========
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ========== EVENT DELEGATION SYSTEM ==========
function handleGlobalEvents() {
  // Close sidebar when clicking outside (mobile)
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('menu-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(e.target) && 
        e.target !== toggleBtn &&
        sidebar.classList.contains('active')) {
      toggleSidebar();
    }
  }, { passive: true });

  // Close sidebar with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('sidebar').classList.contains('active')) {
      toggleSidebar();
    }
  }, { passive: true });

  // Responsive behavior
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      if (window.innerWidth > 768 && sidebar.classList.contains('active')) {
        toggleSidebar();
      }
    }, 150);
  }, { passive: true });
}
// ===== LASH STYLE QUIZ =====
document.addEventListener('DOMContentLoaded', function() {
  const quizContainer = document.querySelector('.quiz-container');
  const quizSteps = Array.from(document.querySelectorAll('.quiz-step'));
  const quizOptions = Array.from(document.querySelectorAll('.quiz-option'));
  let currentStep = 1;
  let userSelections = {};

  // Initialize quiz
  showStep(currentStep);

  // Handle option selection
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      const step = this.closest('.quiz-step').dataset.step;
      const selectionKey = this.dataset.style || this.dataset.property;
      
      // Store user selection
      userSelections[`step${step}`] = selectionKey;
      
      // Visual feedback
      quizOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      
      // Auto-advance after 500ms
      setTimeout(() => {
        if (currentStep < quizSteps.length) {
          currentStep++;
          showStep(currentStep);
        } else {
          showQuizResults();
        }
      }, 500);
    });
  });

  // Show current step
  function showStep(step) {
    quizSteps.forEach(s => s.classList.remove('active'));
    document.querySelector(`.quiz-step[data-step="${step}"]`).classList.add('active');
  }

  // Calculate and display results
  function showQuizResults() {
    const results = calculateLashStyle();
    const quizHTML = `
      <div class="quiz-results">
        <h3>Your Perfect Match: <span>${results.style}</span></h3>
        <div class="result-card">
          <img src="assets/hubs/lashes/${results.image}" alt="${results.style}">
          <div class="result-details">
            <p>${results.description}</p>
            <ul>
              <li><strong>Best for:</strong> ${results.bestFor}</li>
              <li><strong>Duration:</strong> ${results.duration}</li>
              <li><strong>Average Cost:</strong> ${results.cost}</li>
            </ul>
            <button id="match-artists" class="btn-primary">
              <i class="fas fa-users"></i> Match Me With Artists
            </button>
          </div>
        </div>
      </div>
    `;
    
    quizContainer.innerHTML = quizHTML;
    
    // Handle matching button
    document.getElementById('match-artists')?.addEventListener('click', function() {
      filterArtistsByStyle(results.style);
      document.querySelector('.providers-grid').scrollIntoView({
        behavior: 'smooth'
      });
    });
  }

  // Determine lash style based on selections
  function calculateLashStyle() {
    const styles = {
      natural: {
        style: "Classic Lashes",
        image: "classic-result.jpg",
        description: "1:1 extension ratio for a natural, enhanced look. Perfect for first-timers or minimal makeup wearers.",
        bestFor: "Office wear, everyday enhancement",
        duration: "60-90 minutes",
        cost: "$80-$120"
      },
      glam: {
        style: "Volume Lashes (2D-5D)",
        image: "volume-result.jpg",
        description: "Fluffy, dramatic fans with 2-5 extensions per natural lash. Creates full, wispy texture.",
        bestFor: "Special events, photo shoots",
        duration: "2-2.5 hours",
        cost: "$120-$180"
      },
      // Add more result profiles as needed
    };

    // Simple logic - adapt based on your quiz steps
    return userSelections.step1 === 'natural' ? styles.natural : styles.glam;
  }

  // Filter artists by recommended style
  function filterArtistsByStyle(style) {
    const allArtists = Array.from(document.querySelectorAll('.providers-grid .provider-card'));
    
    allArtists.forEach(artist => {
      const artistSpecialty = artist.querySelector('p').textContent.toLowerCase();
      artist.style.display = artistSpecialty.includes(style.toLowerCase()) ? 'block' : 'none';
    });

    // Show message if no matches
    const visibleArtists = allArtists.filter(a => a.style.display !== 'none');
    if (visibleArtists.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <p>No ${style} specialists available now. <a href="#waitlist">Join waitlist</a>.</p>
      `;
      document.querySelector('.providers-grid').appendChild(noResults);
    }
  }
});
// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with animation frame for smooth startup
  requestAnimationFrame(() => {
    // Sidebar toggle
    document.getElementById('menu-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebar();
    }, { passive: false });

    // Setup all systems
    setupServiceHubs();
    setupWaitlistForm();
    handleGlobalEvents();
  });
});
// Artist Tier Toggling
document.querySelectorAll('.tier-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.tier-btn').forEach(b => b.classList.remove('active'));
    // Add active to clicked button
    btn.classList.add('active');
    
    // Hide all tier contents
    document.querySelectorAll('.tier-content').forEach(content => {
      content.style.display = 'none';
    });
    
    // Show selected tier
    const tierId = btn.getAttribute('data-tier') + '-tier';
    document.getElementById(tierId).style.display = 'grid';
  });
});

// Recommendation Filters
document.querySelectorAll('.rec-filter').forEach(filter => {
  filter.addEventListener('click', () => {
    document.querySelectorAll('.rec-filter').forEach(f => f.classList.remove('active'));
    filter.classList.add('active');
    // In a real app, you'd fetch filtered results here
  });
});
// ===== LASH STYLE QUIZ =====
document.addEventListener('DOMContentLoaded', function() {
  const quizContainer = document.querySelector('.quiz-container');
  const quizSteps = Array.from(document.querySelectorAll('.quiz-step'));
  const quizOptions = Array.from(document.querySelectorAll('.quiz-option'));
  let currentStep = 1;
  let userSelections = {};

  // Initialize quiz
  showStep(currentStep);

  // Handle option selection
  quizOptions.forEach(option => {
    option.addEventListener('click', function() {
      const step = this.closest('.quiz-step').dataset.step;
      const selectionKey = this.dataset.style || this.dataset.property;
      
      // Store user selection
      userSelections[`step${step}`] = selectionKey;
      
      // Visual feedback
      quizOptions.forEach(opt => opt.classList.remove('selected'));
      this.classList.add('selected');
      
      // Auto-advance after 500ms
      setTimeout(() => {
        if (currentStep < quizSteps.length) {
          currentStep++;
          showStep(currentStep);
        } else {
          showQuizResults();
        }
      }, 500);
    });
  });

  // Show current step
  function showStep(step) {
    quizSteps.forEach(s => s.classList.remove('active'));
    document.querySelector(`.quiz-step[data-step="${step}"]`).classList.add('active');
  }

  // Calculate and display results
  function showQuizResults() {
    const results = calculateLashStyle();
    const quizHTML = `
      <div class="quiz-results">
        <h3>Your Perfect Match: <span>${results.style}</span></h3>
        <div class="result-card">
          <img src="assets/hubs/lashes/${results.image}" alt="${results.style}">
          <div class="result-details">
            <p>${results.description}</p>
            <ul>
              <li><strong>Best for:</strong> ${results.bestFor}</li>
              <li><strong>Duration:</strong> ${results.duration}</li>
              <li><strong>Average Cost:</strong> ${results.cost}</li>
            </ul>
            <button id="match-artists" class="btn-primary">
              <i class="fas fa-users"></i> Match Me With Artists
            </button>
          </div>
        </div>
      </div>
    `;
    
    quizContainer.innerHTML = quizHTML;
    
    // Handle matching button
    document.getElementById('match-artists')?.addEventListener('click', function() {
      filterArtistsByStyle(results.style);
      document.querySelector('.providers-grid').scrollIntoView({
        behavior: 'smooth'
      });
    });
  }

  // Determine lash style based on selections
  function calculateLashStyle() {
    const styles = {
      natural: {
        style: "Classic Lashes",
        image: "classic-result.jpg",
        description: "1:1 extension ratio for a natural, enhanced look. Perfect for first-timers or minimal makeup wearers.",
        bestFor: "Office wear, everyday enhancement",
        duration: "60-90 minutes",
        cost: "$80-$120"
      },
      glam: {
        style: "Volume Lashes (2D-5D)",
        image: "volume-result.jpg",
        description: "Fluffy, dramatic fans with 2-5 extensions per natural lash. Creates full, wispy texture.",
        bestFor: "Special events, photo shoots",
        duration: "2-2.5 hours",
        cost: "$120-$180"
      },
      // Add more result profiles as needed
    };

    // Simple logic - adapt based on your quiz steps
    return userSelections.step1 === 'natural' ? styles.natural : styles.glam;
  }

  // Filter artists by recommended style
  function filterArtistsByStyle(style) {
    const allArtists = Array.from(document.querySelectorAll('.providers-grid .provider-card'));
    
    allArtists.forEach(artist => {
      const artistSpecialty = artist.querySelector('p').textContent.toLowerCase();
      artist.style.display = artistSpecialty.includes(style.toLowerCase()) ? 'block' : 'none';
    });

    // Show message if no matches
    const visibleArtists = allArtists.filter(a => a.style.display !== 'none');
    if (visibleArtists.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.innerHTML = `
        <p>No ${style} specialists available now. <a href="#waitlist">Join waitlist</a>.</p>
      `;
      document.querySelector('.providers-grid').appendChild(noResults);
    }
  }
});
// Close hub buttons
document.querySelectorAll('.close-hub-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    this.closest('.service-hub').classList.remove('active');
  });
});