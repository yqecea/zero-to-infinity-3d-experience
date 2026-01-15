        lucide.createIcons();

        // ==========================================
        // GLOBAL STATE: DEPTH-BASED NAVIGATION
        // ==========================================
        let currentDepth = 0;
        const maxDepth = 10000;
        const depthSensitivity = 8;
        let targetDepth = 0;
        let isScrolling = false;
        let scrollVelocity = 0;

        // Section depth mappings
        const sections = [
            { id: 'hero', start: 0, end: 800 },
            { id: 'history', start: 800, end: 2500 },
            { id: 'anatomy', start: 2500, end: 4000 },
            { id: 'deep-dive', start: 4000, end: 5500 },
            { id: 'formation', start: 5500, end: 7000 },
            { id: 'thermodynamics', start: 7000, end: 8200 },
            { id: 'evidence', start: 8200, end: 9200 },
            { id: 'frontier', start: 9200, end: 10000 }
        ];

        // ==========================================
        // 0. UTILS: SCRAMBLE TEXT & MAGNETIC
        // ==========================================

        class ScrambleText {
            constructor(element, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&') {
                this.element = element;
                this.originalText = element.innerText;
                this.chars = chars;
                this.frameId = null;
                this.update = this.update.bind(this);
            }

            start(duration = 1000) {
                const startTime = Date.now();
                const length = this.originalText.length;

                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    let result = '';
                    const revealIndex = Math.floor(progress * length);

                    for (let i = 0; i < length; i++) {
                        if (i < revealIndex) {
                            result += this.originalText[i];
                        } else if (this.originalText[i] === ' ') {
                            result += ' ';
                        } else {
                            result += this.chars[Math.floor(Math.random() * this.chars.length)];
                        }
                    }

                    this.element.innerText = result;

                    if (progress < 1) {
                        this.frameId = requestAnimationFrame(animate);
                    } else {
                        this.element.innerText = this.originalText;
                    }
                };

                if (this.frameId) cancelAnimationFrame(this.frameId);
                animate();
            }
        }

        // NOTE: Glass card tilt effect is handled in the unified section below
        // Removed duplicate handlers for performance

        // ==========================================
        // 1. HERO BOOT SEQUENCE
        // ==========================================
        window.addEventListener('load', () => {
            const revealElements = document.querySelectorAll('.reveal-text');

            revealElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('revealed');
                    el.classList.add('glitch-text');
                    el.setAttribute('data-text', el.innerText);

                    if (el.innerText.includes('ZERO') || el.innerText.includes('INFINITY') || el.innerText.includes('TO')) {
                        new ScrambleText(el).start(1500);
                    }

                    setTimeout(() => {
                        el.classList.remove('glitch-text');
                    }, 2000);

                }, 500 + (index * 400));
            });

            setTimeout(() => {
                const btn = document.getElementById('hero-buttons');
                if (btn) {
                    btn.style.transition = 'opacity 2s ease';
                    btn.style.opacity = '1';
                }
            }, 3000);
        });

        // ==========================================
        // 2. 3D TUNNEL SCENE (THREE.JS)
        // ==========================================
        const tunnelContainer = document.getElementById('tunnel-scene');
        let tunnelCamera, tunnelScene, tunnelRenderer;
        let stars, tunnelRings;
        let nebulae, sparkles; // Additional particle systems

        // Mouse position for parallax effect
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        // Track mouse movement for parallax
        document.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        if (tunnelContainer) {
            // ==========================================
            // PERFORMANCE TIER DETECTION - DUAL-STATE ARCHITECTURE
            // ==========================================
            // State A (DESKTOP): Full cinematic luxury
            // State B (MOBILE): Ruthless efficiency for 60 FPS
            const performanceTier = (function () {
                const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                const isSmallScreen = window.innerWidth < 768;
                const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
                return (isMobileUA || isSmallScreen || isTouchDevice) ? 'MOBILE' : 'DESKTOP';
            })();

            console.log(`🎮 Performance Tier: ${performanceTier}`);

            // Desktop vs Mobile configuration
            const config = performanceTier === 'MOBILE' ? {
                starsCount: 100,           // NUCLEAR: -97.5% from 4000
                inflowCount: 0,            // NUCLEAR: Disabled on mobile
                ringCount: 5,              // NUCLEAR: -80% from 25
                ringSegments: 16,          // -75% from 64
                sphereSegments: 16,        // -75% from 64
                pixelRatio: 1.0,           // -50% from 2.0
                antialias: false,          // GPU saver
                particleSize: 0.8          // Larger = fewer needed
            } : {
                starsCount: 4000,
                inflowCount: 150,
                ringCount: 25,
                ringSegments: 64,
                sphereSegments: 64,
                pixelRatio: Math.min(window.devicePixelRatio, 2),
                antialias: true,
                particleSize: 0.3
            };

            tunnelScene = new THREE.Scene();
            tunnelCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
            tunnelRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: config.antialias });
            tunnelRenderer.setSize(window.innerWidth, window.innerHeight);
            tunnelRenderer.setPixelRatio(config.pixelRatio);
            tunnelContainer.appendChild(tunnelRenderer.domElement);

            // Create starfield with config-driven count
            const starsGeometry = new THREE.BufferGeometry();
            const starsCount = config.starsCount;
            const posArray = new Float32Array(starsCount * 3);
            const velocityArray = new Float32Array(starsCount);

            for (let i = 0; i < starsCount * 3; i += 3) {
                // Distribute stars in a cylinder around the camera path
                const angle = Math.random() * Math.PI * 2;
                const radius = 5 + Math.random() * 50;
                posArray[i] = Math.cos(angle) * radius;     // x
                posArray[i + 1] = Math.sin(angle) * radius;   // y
                posArray[i + 2] = Math.random() * 2000 - 1000; // z (deep tunnel)
                velocityArray[i / 3] = 0.5 + Math.random() * 0.5;
            }

            starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const starMaterial = new THREE.PointsMaterial({
                size: config.particleSize,
                color: 0xffffff,
                transparent: true,
                opacity: 0.9,
                sizeAttenuation: true
            });

            stars = new THREE.Points(starsGeometry, starMaterial);
            tunnelScene.add(stars);

            // === CLEAN VORTEX TUNNEL ===
            // Fewer rings, unified orange-red color (like M87*)
            tunnelRings = new THREE.Group();
            const ringCount = config.ringCount;
            const ringSegments = config.ringSegments;
            for (let i = 0; i < ringCount; i++) {
                const progress = i / ringCount;
                const baseRadius = 50 - progress * 35; // Funnel from 50 to 15
                const innerR = Math.max(8, baseRadius - 2);
                const outerR = Math.max(10, baseRadius);

                const ringGeometry = new THREE.RingGeometry(innerR, outerR, ringSegments);

                // Unified monochrome color scheme: white -> silver -> dark grey
                const hue = 0.0; // Monochrome
                const saturation = 0.0;
                const lightness = 0.8 - progress * 0.6; // White to dark gray
                const color = new THREE.Color().setHSL(hue, saturation, lightness);

                const ringMaterial = new THREE.MeshBasicMaterial({
                    color: color,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.15 + progress * 0.35 // More visible toward center
                });
                const ring = new THREE.Mesh(ringGeometry, ringMaterial);
                ring.position.z = -i * 25; // Spaced out more
                tunnelRings.add(ring);
            }
            tunnelScene.add(tunnelRings);

            // === INWARD-FLOWING PARTICLES (shows suction) ===
            const inflowGeometry = new THREE.BufferGeometry();
            const inflowCount = config.inflowCount;
            const inflowPositions = new Float32Array(inflowCount * 3);
            const inflowVelocities = new Float32Array(inflowCount); // Speed toward center
            const inflowAngles = new Float32Array(inflowCount); // Starting angle
            const inflowRadii = new Float32Array(inflowCount); // Current radius

            for (let i = 0; i < inflowCount; i++) {
                inflowAngles[i] = Math.random() * Math.PI * 2;
                inflowRadii[i] = 20 + Math.random() * 60; // Start at outer edge
                inflowVelocities[i] = 0.1 + Math.random() * 0.3;

                const i3 = i * 3;
                inflowPositions[i3] = Math.cos(inflowAngles[i]) * inflowRadii[i];
                inflowPositions[i3 + 1] = Math.sin(inflowAngles[i]) * inflowRadii[i];
                inflowPositions[i3 + 2] = Math.random() * 800 - 400;
            }

            inflowGeometry.setAttribute('position', new THREE.BufferAttribute(inflowPositions, 3));

            const inflowMaterial = new THREE.PointsMaterial({
                size: 2,
                color: 0xffffff, // Silver/White
                transparent: true,
                opacity: 0.7,
                blending: THREE.AdditiveBlending
            });

            const inflowParticles = new THREE.Points(inflowGeometry, inflowMaterial);
            tunnelScene.add(inflowParticles);

            // === BLACK HOLE DESTINATION ===
            // Main black sphere
            const bhGeometry = new THREE.SphereGeometry(20, config.sphereSegments, config.sphereSegments);
            const bhMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const blackHole = new THREE.Mesh(bhGeometry, bhMaterial);
            blackHole.position.z = -700;
            tunnelScene.add(blackHole);

            // === BRIGHT EVENT HORIZON (key focal point) ===
            const horizonGeometry = new THREE.RingGeometry(21, 28, config.ringSegments);
            const horizonMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95
            });
            const eventHorizonRing = new THREE.Mesh(horizonGeometry, horizonMaterial);
            eventHorizonRing.position.z = -700;
            tunnelScene.add(eventHorizonRing);

            // Outer glow halo
            const haloGeometry = new THREE.RingGeometry(28, 60, config.ringSegments);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4
            });
            const haloRing = new THREE.Mesh(haloGeometry, haloMaterial);
            haloRing.position.z = -700;
            tunnelScene.add(haloRing);

            // Accretion disk (tilted for 3D effect)
            const diskGeometry = new THREE.RingGeometry(25, 100, config.ringSegments);
            const diskMaterial = new THREE.MeshBasicMaterial({
                color: 0xcccccc,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.35
            });
            const accretionDisk = new THREE.Mesh(diskGeometry, diskMaterial);
            accretionDisk.position.z = -700;
            accretionDisk.rotation.x = Math.PI / 2.5;
            tunnelScene.add(accretionDisk);

            // Photon ring (bright thin ring)
            const photonRingGeometry = new THREE.TorusGeometry(23, 0.8, 16, 100);
            const photonRingMaterial = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 1
            });
            const photonRing = new THREE.Mesh(photonRingGeometry, photonRingMaterial);
            photonRing.position.z = -700;
            photonRing.rotation.x = Math.PI / 2;
            tunnelScene.add(photonRing);

            tunnelCamera.position.z = 100;

            // OPTIMIZATION: Cache DOM element outside loop
            const speedLinesEl = document.getElementById('speedLines');
            let frameCount = 0;
            let lastVelocity = 0;

            // Animation loop (OPTIMIZED)
            function animateTunnel() {
                requestAnimationFrame(animateTunnel);
                frameCount++;

                // Smooth depth interpolation
                currentDepth += (targetDepth - currentDepth) * 0.08;

                // Update camera Z based on depth
                const normalizedDepth = currentDepth / maxDepth;
                tunnelCamera.position.z = 100 - normalizedDepth * 1300;

                // Calculate scroll velocity for effects
                const depthDelta = Math.abs(targetDepth - currentDepth);
                scrollVelocity = depthDelta * 0.01;

                // OPTIMIZATION: Skip heavy updates if not scrolling (velocity near zero)
                const isScrolling = scrollVelocity > 0.001;

                // Update star positions only when scrolling
                if (isScrolling) {
                    const positions = starsGeometry.attributes.position.array;
                    const camZ = tunnelCamera.position.z;
                    for (let i = 0; i < starsCount; i++) {
                        const i3 = i * 3;
                        positions[i3 + 2] += scrollVelocity * velocityArray[i] * 2;

                        if (positions[i3 + 2] > camZ + 100) {
                            positions[i3 + 2] = camZ - 800;
                            const angle = Math.random() * 6.283; // Pre-calculated PI*2
                            const radius = 5 + Math.random() * 50;
                            positions[i3] = Math.cos(angle) * radius;
                            positions[i3 + 1] = Math.sin(angle) * radius;
                        }
                    }
                    starsGeometry.attributes.position.needsUpdate = true;
                    starMaterial.size = 0.3 + scrollVelocity * 0.5;
                }

                // Rotate tunnel rings (always, but minimal when not scrolling)
                if (tunnelRings) {
                    const rotSpeed = isScrolling ? (0.002 + scrollVelocity * 0.008) : 0.001;
                    tunnelRings.rotation.z += rotSpeed;

                    // OPTIMIZATION: Update individual rings only every 2nd frame
                    if (frameCount & 1) {
                        const rings = tunnelRings.children;
                        const len = rings.length;
                        for (let ri = 0; ri < len; ri++) {
                            rings[ri].rotation.z += 0.0008 * (ri & 1 ? -0.5 : 1);
                        }
                    }
                }

                // Inward particles - update only when scrolling
                if (inflowParticles && isScrolling) {
                    const inflowPos = inflowGeometry.attributes.position.array;
                    const camZ = tunnelCamera.position.z;
                    for (let i = 0; i < inflowCount; i++) {
                        inflowRadii[i] -= inflowVelocities[i] * (0.5 + scrollVelocity * 2);
                        inflowAngles[i] += 0.02 + inflowVelocities[i] * 0.05;

                        if (inflowRadii[i] < 5) {
                            inflowRadii[i] = 20 + Math.random() * 60;
                            inflowAngles[i] = Math.random() * 6.283;
                        }

                        const i3 = i * 3;
                        inflowPos[i3] = Math.cos(inflowAngles[i]) * inflowRadii[i];
                        inflowPos[i3 + 1] = Math.sin(inflowAngles[i]) * inflowRadii[i];
                        inflowPos[i3 + 2] += scrollVelocity * 0.8;
                        if (inflowPos[i3 + 2] > camZ + 50) {
                            inflowPos[i3 + 2] = camZ - 500;
                        }
                    }
                    inflowGeometry.attributes.position.needsUpdate = true;
                    inflowMaterial.opacity = 0.5 + scrollVelocity * 0.3;
                }

                // Rotate accretion disk (always, it's cheap)
                accretionDisk.rotation.z += 0.003 + scrollVelocity * 0.008;
                photonRing.rotation.z -= 0.005;

                // OPTIMIZATION: Update glow only every 4th frame
                if ((frameCount & 3) === 0) {
                    const time = frameCount * 0.016; // Approximate time
                    horizonMaterial.opacity = 0.8 + Math.sin(time * 2) * 0.15;
                    haloMaterial.opacity = 0.3 + Math.sin(time * 1.5) * 0.1;
                }

                // Mouse parallax
                mouseX += (targetMouseX - mouseX) * 0.05;
                mouseY += (targetMouseY - mouseY) * 0.05;
                tunnelCamera.position.x = mouseX * 8;
                tunnelCamera.position.y = -mouseY * 5;
                tunnelCamera.lookAt(0, 0, tunnelCamera.position.z - 100);

                if (stars) {
                    stars.rotation.x = mouseY * 0.1;
                    stars.rotation.y = mouseX * 0.1;
                }

                // OPTIMIZATION: Toggle speed lines only when velocity changes significantly
                if (speedLinesEl && Math.abs(scrollVelocity - lastVelocity) > 0.1) {
                    speedLinesEl.classList.toggle('active', scrollVelocity > 0.5);
                    lastVelocity = scrollVelocity;
                }

                tunnelRenderer.render(tunnelScene, tunnelCamera);
            }
            animateTunnel();

            window.addEventListener('resize', () => {
                tunnelCamera.aspect = window.innerWidth / window.innerHeight;
                tunnelCamera.updateProjectionMatrix();
                tunnelRenderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        // ==========================================
        // 3. SCROLL → DEPTH NAVIGATION (Smart Scroll)
        // ==========================================
        document.addEventListener('wheel', (e) => {
            // Find the currently active HUD section
            const activeSection = document.querySelector('.hud-section.active');

            if (activeSection) {
                // Check if the scroll target is inside the active section
                const isInsideSection = activeSection.contains(e.target);

                if (isInsideSection) {
                    // Check if section has scrollable content
                    const scrollableContent = activeSection.querySelector('.hud-content');
                    if (scrollableContent) {
                        const scrollTop = activeSection.scrollTop;
                        const scrollHeight = activeSection.scrollHeight;
                        const clientHeight = activeSection.clientHeight;
                        const isScrollable = scrollHeight > clientHeight;

                        if (isScrollable) {
                            // Scrolling down and not at bottom
                            if (e.deltaY > 0 && scrollTop + clientHeight < scrollHeight - 5) {
                                // Allow normal scroll inside section
                                return;
                            }
                            // Scrolling up and not at top
                            if (e.deltaY < 0 && scrollTop > 5) {
                                // Allow normal scroll inside section
                                return;
                            }
                        }
                    }
                }
            }

            // If we reach here, handle depth navigation
            e.preventDefault();

            // Hide scroll hint after first scroll
            const scrollHint = document.getElementById('scrollHint');
            if (scrollHint && !scrollHint.classList.contains('hidden')) {
                scrollHint.classList.add('hidden');
            }

            // Update target depth based on scroll
            targetDepth = Math.max(0, Math.min(maxDepth, targetDepth + e.deltaY * depthSensitivity / 10));

            // Update HUD sections
            updateHUD(currentDepth);

            // Update depth indicator
            updateDepthIndicator(currentDepth);

        }, { passive: false });

        // ==========================================
        // 3.5 TOUCH NAVIGATION (Mobile Support)
        // ==========================================
        let touchStartY = 0;
        let touchStartTime = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            // Instant speed lines feedback on touch
            const speedLines = document.getElementById('speedLines');
            if (speedLines) speedLines.classList.add('active');
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const deltaY = touchStartY - touchY;

            // Check if inside scrollable section content
            const activeSection = document.querySelector('.hud-section.active');
            if (activeSection) {
                const scrollTop = activeSection.scrollTop;
                const scrollHeight = activeSection.scrollHeight;
                const clientHeight = activeSection.clientHeight;
                const isScrollable = scrollHeight > clientHeight + 10;

                if (isScrollable) {
                    // Allow native scroll if not at boundaries
                    if (deltaY > 0 && scrollTop + clientHeight < scrollHeight - 5) return;
                    if (deltaY < 0 && scrollTop > 5) return;
                }
            }

            // Handle depth navigation
            e.preventDefault();

            // Hide scroll hint
            const scrollHint = document.getElementById('scrollHint');
            if (scrollHint && !scrollHint.classList.contains('hidden')) {
                scrollHint.classList.add('hidden');
            }

            // Update depth - HYPER SENSITIVITY for mobile (5x multiplier)
            targetDepth = Math.max(0, Math.min(maxDepth, targetDepth + deltaY * 5.0));
            touchStartY = touchY;

            // Update HUD
            updateHUD(currentDepth);
            updateDepthIndicator(currentDepth);

        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            // Momentum for fast swipes
            const touchDuration = Date.now() - touchStartTime;
            if (touchDuration < 150) {
                const lastTouch = e.changedTouches[0];
                const velocity = (touchStartY - lastTouch.clientY) / touchDuration;
                targetDepth = Math.max(0, Math.min(maxDepth, targetDepth + velocity * 800));
            }
        }, { passive: true });

        // ==========================================
        // 4. HUD OVERLAY CONTROLLER
        // ==========================================
        function updateHUD(depth) {
            sections.forEach(s => {
                const el = document.getElementById(s.id);
                if (!el) return;

                const fadeRange = 200; // Depth units for fade in/out

                if (depth >= s.start - fadeRange && depth <= s.end + fadeRange) {
                    // Calculate opacity based on position within section
                    let opacity = 1;

                    if (depth < s.start) {
                        // Fading in
                        opacity = 1 - (s.start - depth) / fadeRange;
                    } else if (depth > s.end) {
                        // Fading out
                        opacity = 1 - (depth - s.end) / fadeRange;
                    }

                    opacity = Math.max(0, Math.min(1, opacity));

                    if (opacity > 0) {
                        el.classList.add('active');
                        el.style.opacity = opacity;
                    } else {
                        el.classList.remove('active');
                        el.style.opacity = 0;
                    }
                } else {
                    el.classList.remove('active');
                    el.style.opacity = 0;
                }
            });

            // Update depth markers
            document.querySelectorAll('.depth-marker').forEach(marker => {
                const sectionId = marker.dataset.section;
                const section = sections.find(s => s.id === sectionId);
                if (section && depth >= section.start && depth <= section.end) {
                    marker.classList.add('active');
                } else {
                    marker.classList.remove('active');
                }
            });
        }

        function updateDepthIndicator(depth) {
            const progress = document.getElementById('depthProgress');
            if (progress) {
                const percentage = (depth / maxDepth) * 100;
                progress.style.height = percentage + '%';
            }
        }

        // ==========================================
        // 5. NAVIGATION CLICK HANDLERS
        // ==========================================
        function navigateToDepth(depth) {
            targetDepth = Math.max(0, Math.min(maxDepth, depth));
        }

        // Nav link clicks
        document.querySelectorAll('[data-nav-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.dataset.navSection;
                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    navigateToDepth(section.start + 100);
                }
            });
        });

        // Home link
        const homeLink = document.querySelector('[data-nav-home]');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                navigateToDepth(0);
            });
        }

        // Depth marker clicks
        document.querySelectorAll('.depth-marker').forEach(marker => {
            marker.addEventListener('click', () => {
                const sectionId = marker.dataset.section;
                const section = sections.find(s => s.id === sectionId);
                if (section) {
                    navigateToDepth(section.start + 100);
                }
            });
        });

        // ==========================================
        // 6. HORIZONTAL TIMELINE KEYBOARD NAV
        // ==========================================
        const timelineContainer = document.querySelector('.horizontal-timeline-container');
        if (timelineContainer) {
            document.addEventListener('keydown', (e) => {
                // Only handle if history section is active
                const historySection = document.getElementById('history');
                if (historySection && historySection.classList.contains('active')) {
                    if (e.key === 'ArrowLeft') {
                        timelineContainer.scrollLeft -= 320;
                    } else if (e.key === 'ArrowRight') {
                        timelineContainer.scrollLeft += 320;
                    }
                }
            });

            // Prevent wheel from triggering depth navigation when over timeline
            timelineContainer.addEventListener('wheel', (e) => {
                e.stopPropagation();
                timelineContainer.scrollLeft += e.deltaY;
            }, { passive: false });
        }

        // ==========================================
        // 7. BLACK HOLE VISUALIZER (Anatomy Section)
        // ==========================================
        const canvas = document.getElementById('blackhole-canvas');
        const container = document.getElementById('blackhole-wrapper');

        if (canvas && container) {
            const bhScene = new THREE.Scene();
            const bhCamera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
            const bhRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

            const updateSize = () => {
                const w = container.clientWidth;
                const h = container.clientHeight;
                bhRenderer.setSize(w, h);
                bhCamera.aspect = w / h;
                bhCamera.updateProjectionMatrix();
            };
            updateSize();
            window.addEventListener('resize', updateSize);

            // Black Hole Mesh Construction
            const eventHorizon = new THREE.Mesh(
                new THREE.SphereGeometry(1, 64, 64),
                new THREE.MeshBasicMaterial({ color: 0x000000 })
            );
            bhScene.add(eventHorizon);

            // Photon Ring (Gold)
            const photonRing = new THREE.Mesh(
                new THREE.TorusGeometry(1.5, 0.02, 16, 100),
                new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
            );
            photonRing.rotation.x = Math.PI / 2;
            bhScene.add(photonRing);

            // Accretion Disk
            const diskParticles = new THREE.BufferGeometry();
            const diskCount = 1000; // OPTIMIZED: Reduced from 2000
            const diskPosArray = new Float32Array(diskCount * 3);
            const diskColorArray = new Float32Array(diskCount * 3);

            const colorInside = new THREE.Color(0xffffff);
            const colorOutside = new THREE.Color(0x333333);

            for (let i = 0; i < diskCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = 2.0 + Math.random() * 3.5;

                diskPosArray[i * 3] = Math.cos(angle) * radius;
                diskPosArray[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
                diskPosArray[i * 3 + 2] = Math.sin(angle) * radius;

                const t = (radius - 2.0) / 3.5;
                const finalColor = colorInside.clone().lerp(colorOutside, t);
                diskColorArray[i * 3] = finalColor.r;
                diskColorArray[i * 3 + 1] = finalColor.g;
                diskColorArray[i * 3 + 2] = finalColor.b;
            }

            diskParticles.setAttribute('position', new THREE.BufferAttribute(diskPosArray, 3));
            diskParticles.setAttribute('color', new THREE.BufferAttribute(diskColorArray, 3));

            const diskMaterial = new THREE.PointsMaterial({
                size: 0.05,
                vertexColors: true,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const accretionDiskMesh = new THREE.Points(diskParticles, diskMaterial);
            accretionDiskMesh.rotation.x = 0.2;
            accretionDiskMesh.rotation.z = 0.1;
            bhScene.add(accretionDiskMesh);

            bhCamera.position.z = 6;
            bhCamera.position.y = 1;
            bhCamera.lookAt(0, 0, 0);

            // OPTIMIZATION: Only animate when section is visible
            let bhAnimating = false;

            function animateBH() {
                if (!bhAnimating) return;
                requestAnimationFrame(animateBH);
                accretionDiskMesh.rotation.y -= 0.005;
                photonRing.lookAt(bhCamera.position);
                bhRenderer.render(bhScene, bhCamera);
            }

            // Start/stop animation based on visibility
            const bhObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    bhAnimating = entry.isIntersecting;
                    if (bhAnimating) animateBH();
                });
            }, { threshold: 0.1 });

            bhObserver.observe(container);
        }

        // ==========================================
        // 8. INITIAL STATE
        // ==========================================
        updateHUD(0);
        updateDepthIndicator(0);

        // ==========================================
        // 9. ENHANCED DYNAMIC ANIMATIONS
        // ==========================================

        // Reveal text animation on load
        setTimeout(() => {
            document.querySelectorAll('.reveal-text').forEach((el, i) => {
                setTimeout(() => {
                    el.classList.add('revealed');
                }, i * 200);
            });
        }, 500);

        // Staggered animation for glossary and grid items
        function staggerAnimateElements(selector, delay = 100) {
            const elements = document.querySelectorAll(selector);
            elements.forEach((el, i) => {
                el.style.animationDelay = `${i * delay}ms`;
            });
        }

        staggerAnimateElements('#deep-dive .grid .glass-card', 80);
        staggerAnimateElements('#anatomy .grid .glass-card', 100);
        staggerAnimateElements('.key-figures-grid > div', 150);

        // Optimized glass card tilt (throttled)
        let tiltThrottle = false;
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                if (tiltThrottle) return;
                tiltThrottle = true;
                requestAnimationFrame(() => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    card.style.setProperty('--mouse-x', `${x}%`);
                    card.style.setProperty('--mouse-y', `${y}%`);
                    tiltThrottle = false;
                });
            });
        });

        // Data bar fill on visibility (lightweight)
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const bars = entry.target.querySelectorAll('.data-bar-fill');
                    for (let i = 0; i < bars.length; i++) {
                        bars[i].style.transitionDelay = `${i * 150}ms`;
                    }
                    observer.unobserve(entry.target); // Stop observing after triggered
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.hud-section').forEach(section => observer.observe(section));

        console.log('🌌 Optimized animations initialized!');

        // ==========================================
        // 10. MOBILE MENU FUNCTIONALITY
        // ==========================================
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenuClose = document.getElementById('mobile-menu-close');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.add('open');
                document.body.style.overflow = 'hidden';
            });

            if (mobileMenuClose) {
                mobileMenuClose.addEventListener('click', () => {
                    mobileMenu.classList.remove('open');
                    document.body.style.overflow = '';
                });
            }

            // Mobile nav section links
            document.querySelectorAll('[data-mobile-nav]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const sectionId = link.dataset.mobileNav;
                    const section = sections.find(s => s.id === sectionId);
                    if (section) {
                        navigateToDepth(section.start + 100);
                    }
                    mobileMenu.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });

            // Close on swipe right
            let menuTouchStartX = 0;
            mobileMenu.addEventListener('touchstart', (e) => {
                menuTouchStartX = e.touches[0].clientX;
            }, { passive: true });

            mobileMenu.addEventListener('touchend', (e) => {
                const deltaX = e.changedTouches[0].clientX - menuTouchStartX;
                if (deltaX > 100) {
                    mobileMenu.classList.remove('open');
                    document.body.style.overflow = '';
                }
            }, { passive: true });
        }

        // ==========================================
        // 11. TIMELINE TOUCH DRAG SCROLL
        // ==========================================
        const timelineContainerTouch = document.querySelector('.horizontal-timeline-container');
        if (timelineContainerTouch) {
            let isTimelineDragging = false;
            let timelineStartX = 0;
            let timelineScrollLeft = 0;

            timelineContainerTouch.addEventListener('touchstart', (e) => {
                isTimelineDragging = true;
                timelineStartX = e.touches[0].pageX - timelineContainerTouch.offsetLeft;
                timelineScrollLeft = timelineContainerTouch.scrollLeft;
            }, { passive: true });

            timelineContainerTouch.addEventListener('touchmove', (e) => {
                if (!isTimelineDragging) return;
                e.preventDefault();
                const x = e.touches[0].pageX - timelineContainerTouch.offsetLeft;
                const walk = (timelineStartX - x) * 1.5;
                timelineContainerTouch.scrollLeft = timelineScrollLeft + walk;
            }, { passive: false });

            timelineContainerTouch.addEventListener('touchend', () => {
                isTimelineDragging = false;
            }, { passive: true });

            // Mouse drag for touchpad/mouse users
            let isMouseDragging = false;
            timelineContainerTouch.addEventListener('mousedown', (e) => {
                isMouseDragging = true;
                timelineContainerTouch.style.cursor = 'grabbing';
                timelineStartX = e.pageX - timelineContainerTouch.offsetLeft;
                timelineScrollLeft = timelineContainerTouch.scrollLeft;
            });

            timelineContainerTouch.addEventListener('mousemove', (e) => {
                if (!isMouseDragging) return;
                e.preventDefault();
                const x = e.pageX - timelineContainerTouch.offsetLeft;
                const walk = (timelineStartX - x) * 1.5;
                timelineContainerTouch.scrollLeft = timelineScrollLeft + walk;
            });

            timelineContainerTouch.addEventListener('mouseup', () => {
                isMouseDragging = false;
                timelineContainerTouch.style.cursor = 'grab';
            });

            timelineContainerTouch.addEventListener('mouseleave', () => {
                isMouseDragging = false;
                timelineContainerTouch.style.cursor = 'grab';
            });

            timelineContainerTouch.style.cursor = 'grab';
        }

        // ==========================================
        // 12. GLASS CARD TOUCH SPOTLIGHT
        // ==========================================
        document.querySelectorAll('.glass-card').forEach(card => {
            card.addEventListener('touchmove', (e) => {
                const touch = e.touches[0];
                const rect = card.getBoundingClientRect();
                const x = ((touch.clientX - rect.left) / rect.width) * 100;
                const y = ((touch.clientY - rect.top) / rect.height) * 100;
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            }, { passive: true });

            card.addEventListener('touchend', () => {
                // Reset to center after touch ends
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
            }, { passive: true });
        });

        // ==========================================
        // 13. TOUCHPAD SCROLL OPTIMIZATION
        // ==========================================
        // Detect touchpad via deltaMode and adjust sensitivity
        document.addEventListener('wheel', (e) => {
            // deltaMode 0 = pixels (touchpad), 1 = lines (mouse wheel)
            if (e.deltaMode === 0 && Math.abs(e.deltaY) < 50) {
                // This is likely a touchpad - sensitivity is already good
                // The existing wheel handler works fine
            }
        }, { passive: true });

        // Re-initialize Lucide icons for new mobile menu
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        console.log('📱 Mobile & touch support initialized!');
