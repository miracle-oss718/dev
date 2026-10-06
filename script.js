/* =========================================================
   PIANO CLUB RESTAURANT — SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

    const body = document.body;


    /* =====================================================
       MOBILE MENU (page blurs behind it via CSS)
    ===================================================== */

    const menuToggle = $(".menu-toggle");
    const mobileNav = $(".mobile-nav");
    const backdrop = $(".nav-backdrop");

    const setMenu = (open) => {
        if (!menuToggle || !mobileNav) return;
        mobileNav.classList.toggle("open", open);
        menuToggle.classList.toggle("active", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        body.classList.toggle("menu-open", open);
    };

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener("click", () => setMenu(!mobileNav.classList.contains("open")));
        $$("a", mobileNav).forEach((link) => link.addEventListener("click", () => setMenu(false)));
        if (backdrop) backdrop.addEventListener("click", () => setMenu(false));
        window.addEventListener("resize", () => { if (window.innerWidth > 900) setMenu(false); });
    }


    /* =====================================================
       HEADER STATE + SCROLL PROGRESS
    ===================================================== */

    const header = $(".site-header");
    const progress = $(".scroll-progress");
    let ticking = false;

    const onScroll = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;

        if (header) header.classList.toggle("scrolled", y > 30);
        if (progress && max > 0) progress.style.transform = `scaleX(${Math.min(y / max, 1)})`;

        ticking = false;
    };

    window.addEventListener("scroll", () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    onScroll();


    /* =====================================================
       SCROLL REVEAL (one observer for every .reveal)
    ===================================================== */

    const revealItems = $$(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });

        revealItems.forEach((item) => revealObserver.observe(item));
    } else {
        revealItems.forEach((item) => item.classList.add("is-visible"));
    }


    /* =====================================================
       ACTIVE NAV LINK
    ===================================================== */

    const sections = $$("main section[id]");
    const navLinks = $$(".nav-link");

    if ("IntersectionObserver" in window && sections.length && navLinks.length) {
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: "-35% 0px -55% 0px" });

        sections.forEach((section) => navObserver.observe(section));
    }


    /* =====================================================
       DISH LIGHTBOX
       Reads every .menu-item on the page, so adding a dish
       in the HTML is all you need to do.
    ===================================================== */

    const lightbox = $(".lightbox");
    const dishes = $$(".menu-item");

    if (lightbox && dishes.length) {
        const lbImg = $(".lb-image img", lightbox);
        const lbTitle = $(".lb-top h4", lightbox);
        const lbPrice = $(".lb-top .menu-price", lightbox);
        const lbText = $(".lb-figure p", lightbox);
        const lbCount = $(".lb-count", lightbox);

        let current = 0;
        let lastFocused = null;

        const render = (index) => {
            current = (index + dishes.length) % dishes.length;
            const dish = dishes[current];
            const img = $("img", dish);

            lbImg.style.opacity = "0";

            setTimeout(() => {
                lbImg.src = img.getAttribute("src");
                lbImg.alt = img.alt;
                lbImg.style.opacity = "1";
            }, 150);

            lbTitle.textContent = $("h4", dish).textContent;
            lbPrice.textContent = $(".menu-price", dish).textContent;
            lbText.textContent = $(".menu-item-info p", dish).textContent;
            lbCount.textContent = `${current + 1} / ${dishes.length}`;
        };

        const openBox = (index) => {
            lastFocused = document.activeElement;
            render(index);
            lightbox.classList.add("open");
            lightbox.setAttribute("aria-hidden", "false");
            body.classList.add("lb-open");
            $(".lb-close", lightbox).focus();
        };

        const closeBox = () => {
            lightbox.classList.remove("open");
            lightbox.setAttribute("aria-hidden", "true");
            body.classList.remove("lb-open");
            if (lastFocused) lastFocused.focus();
        };

        dishes.forEach((dish, index) => {
            const trigger = $(".menu-image", dish);
            if (trigger) trigger.addEventListener("click", () => openBox(index));
        });

        $(".lb-close", lightbox).addEventListener("click", closeBox);
        $(".lb-prev", lightbox).addEventListener("click", () => render(current - 1));
        $(".lb-next", lightbox).addEventListener("click", () => render(current + 1));

        /* Click the dark area to close */
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) closeBox();
        });

        /* Keyboard */
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                if (lightbox.classList.contains("open")) closeBox();
                else setMenu(false);
            }
            if (!lightbox.classList.contains("open")) return;
            if (event.key === "ArrowLeft") render(current - 1);
            if (event.key === "ArrowRight") render(current + 1);
        });

        /* Swipe on phones */
        let startX = 0;

        lightbox.addEventListener("touchstart", (event) => {
            startX = event.changedTouches[0].clientX;
        }, { passive: true });

        lightbox.addEventListener("touchend", (event) => {
            const diff = event.changedTouches[0].clientX - startX;
            if (Math.abs(diff) < 50) return;
            render(diff > 0 ? current - 1 : current + 1);
        }, { passive: true });
    } else {
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") setMenu(false);
        });
    }

});
