/* =========================================================
   DEVBLOG - MAIN SCRIPT
   Firebase Firestore Version
   ========================================================= */


/* =========================================================
   1. FIREBASE CONFIGURATION
   ========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDQ0B84HytHoXpMU5puN4snng3PrEucPzo",
    authDomain: "mydevblogweb.firebaseapp.com",
    projectId: "mydevblogweb",
    storageBucket: "mydevblogweb.firebasestorage.app",
    messagingSenderId: "916876510396",
    appId: "1:916876510396:web:a1b3a2ed74367c6ab43cb9"
};


/* =========================================================
   2. INITIALIZE FIREBASE
   ========================================================= */

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();


/* =========================================================
   3. DOM ELEMENTS
   ========================================================= */

const mainContent =
    document.getElementById("mainContent");

const searchInput =
    document.getElementById("searchInput");

const themeToggle =
    document.getElementById("themeToggle");

const hamburger =
    document.getElementById("hamburger");

const navLinks =
    document.getElementById("navLinks");


/* =========================================================
   4. GLOBAL POSTS ARRAY
   ========================================================= */

let posts = [];


/* =========================================================
   5. ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   6. GET URL PARAMETER
   ========================================================= */

function getURLParameter(parameter) {

    const params =
        new URLSearchParams(window.location.search);

    return params.get(parameter);
}


/* =========================================================
   7. FORMAT DATE
   ========================================================= */

function formatDate(timestamp) {

    if (!timestamp) {
        return "";
    }

    try {

        let date;

        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else {
            date = new Date(timestamp);
        }

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    } catch (error) {

        return "";

    }
}


/* =========================================================
   8. LOAD PUBLISHED POSTS FROM FIRESTORE
   ========================================================= */

async function loadPosts() {

    try {

        const snapshot = await db
            .collection("posts")
            .where("status", "==", "published")
            .get();


        posts = snapshot.docs.map(function(doc) {

            const data = doc.data();

            return {

                id: doc.id,

                title: data.title || "Untitled Post",

                slug: data.slug || "",

                description:
                    data.excerpt ||
                    data.description ||
                    "",

                category:
                    data.category ||
                    "Other",

                date:
                    formatDate(
                        data.createdAt ||
                        data.updatedAt
                    ),

                author:
                    data.author ||
                    "DevBlog",

                image:
                    data.featuredImage ||
                    "",

                tags:
                    Array.isArray(data.tags)
                        ? data.tags
                        : [],

                content: {

                    introduction:
                        data.content?.introduction ||
                        "",

                    htmlCode:
                        data.content?.htmlCode ||
                        "",

                    cssCode:
                        data.content?.cssCode ||
                        "",

                    jsCode:
                        data.content?.jsCode ||
                        "",

                    conclusion:
                        data.content?.conclusion ||
                        ""

                },

                status:
                    data.status ||
                    "published",

                createdAt:
                    data.createdAt || null,

                updatedAt:
                    data.updatedAt || null

            };

        });


        /* Newest posts first */

        posts.sort(function(a, b) {

            const dateA =
                a.createdAt?.toMillis
                    ? a.createdAt.toMillis()
                    : 0;

            const dateB =
                b.createdAt?.toMillis
                    ? b.createdAt.toMillis()
                    : 0;

            return dateB - dateA;

        });


        console.log(
            "✅ Published posts loaded:",
            posts.length
        );


        return posts;


    } catch (error) {

        console.error(
            "❌ Error loading posts:",
            error
        );


        if (mainContent) {

            mainContent.innerHTML = `

                <section class="empty-state">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h1>
                        Unable to Load Articles
                    </h1>

                    <p>
                        There was a problem connecting
                        to the database.
                    </p>

                    <p style="margin-top:10px;font-size:13px;">
                        Please check your Firebase configuration
                        and Firestore security rules.
                    </p>

                </section>

            `;

        }

        return [];

    }

}


/* =========================================================
   9. THEME
   ========================================================= */

function initializeTheme() {

    const savedTheme =
        localStorage.getItem("devblog-theme");

    const theme =
        savedTheme === "dark"
            ? "dark"
            : "light";

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    updateThemeButton(theme);
}


function updateThemeButton(theme) {

    if (!themeToggle) {
        return;
    }

    const isDark =
        theme === "dark";

    themeToggle.textContent =
        isDark ? "☀️" : "🌙";

    themeToggle.setAttribute(
        "aria-pressed",
        String(isDark)
    );

    themeToggle.setAttribute(
        "aria-label",
        isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}


function toggleTheme() {

    const currentTheme =
        document.documentElement.getAttribute(
            "data-theme"
        );

    const newTheme =
        currentTheme === "dark"
            ? "light"
            : "dark";

    document.documentElement.setAttribute(
        "data-theme",
        newTheme
    );

    localStorage.setItem(
        "devblog-theme",
        newTheme
    );

    updateThemeButton(newTheme);
}


/* =========================================================
   10. MOBILE NAVIGATION
   ========================================================= */

function initializeMobileMenu() {

    if (!hamburger || !navLinks) {
        return;
    }


    hamburger.addEventListener(
        "click",
        function() {

            const isOpen =
                navLinks.classList.toggle("open");

            hamburger.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            hamburger.setAttribute(
                "aria-label",
                isOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
            );

        }
    );


    navLinks
        .querySelectorAll("a")
        .forEach(function(link) {

            link.addEventListener(
                "click",
                function() {

                    navLinks.classList.remove("open");

                    hamburger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    hamburger.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );

                }
            );

        });

}


/* =========================================================
   11. CREATE POST CARD
   ========================================================= */

function createPostCard(post) {

    const imageHTML = post.image

        ? `

            <img
                src="${escapeHTML(post.image)}"
                alt="${escapeHTML(post.title)}"
                loading="lazy"
            >

        `

        : `

            <span class="placeholder-text">
                ${escapeHTML(post.category)}
            </span>

        `;


    return `

        <article class="post-card">

            <div class="card-image">

                ${imageHTML}

                <span class="category-badge">
                    ${escapeHTML(post.category)}
                </span>

            </div>


            <div class="card-body">

                <div class="post-meta">

                    <span>
                        ${escapeHTML(post.date)}
                    </span>

                    <span>
                        ${escapeHTML(post.author)}
                    </span>

                </div>


                <h3>

                    <a
                        href="post.html?id=${encodeURIComponent(post.id)}"
                    >
                        ${escapeHTML(post.title)}
                    </a>

                </h3>


                <p>
                    ${escapeHTML(post.description)}
                </p>


                <a
                    class="read-link"
                    href="post.html?id=${encodeURIComponent(post.id)}"
                    aria-label="Read ${escapeHTML(post.title)}"
                >
                    Read Article →
                </a>

            </div>

        </article>

    `;

}


/* =========================================================
   12. HOME PAGE
   ========================================================= */

function renderHomePage() {

    if (!mainContent) {
        return;
    }


    const category =
        getURLParameter("category");

    const search =
        getURLParameter("search");


    let filteredPosts =
        [...posts];


    /* =====================================================
       CATEGORY FILTER
       ===================================================== */

    if (
        category &&
        category.toLowerCase() !== "all"
    ) {

        filteredPosts =
            filteredPosts.filter(function(post) {

                return (
                    post.category &&
                    post.category.toLowerCase() ===
                    category.toLowerCase()
                );

            });

    }


    /* =====================================================
       SEARCH FILTER
       ===================================================== */

    if (search) {

        const searchTerm =
            search.toLowerCase();


        filteredPosts =
            filteredPosts.filter(function(post) {

                const title =
                    post.title
                        .toLowerCase();


                const description =
                    post.description
                        .toLowerCase();


                const postCategory =
                    post.category
                        .toLowerCase();


                const tagsMatch =
                    post.tags.some(function(tag) {

                        return tag
                            .toLowerCase()
                            .includes(searchTerm);

                    });


                return (

                    title.includes(searchTerm) ||

                    description.includes(searchTerm) ||

                    postCategory.includes(searchTerm) ||

                    tagsMatch

                );

            });

    }


    /* =====================================================
       PAGE TITLE
       ===================================================== */

    let pageTitle =
        "Latest Web Development Tutorials";


    let pageDescription =
        "Learn web development with practical HTML, CSS, JavaScript and coding tutorials.";


    if (category) {

        pageTitle =
            `${category} Tutorials`;

        pageDescription =
            `Learn ${category} with practical web development tutorials, examples and coding guides.`;

    }


    if (search) {

        pageTitle =
            `Search results for "${search}"`;

    }


    /* =====================================================
       POSTS HTML
       ===================================================== */

    const postsHTML =
        filteredPosts.length

            ? `

                <div class="posts-grid">

                    ${filteredPosts
                        .map(createPostCard)
                        .join("")}

                </div>

            `

            : `

                <div class="empty-state">

                    <div class="empty-icon">
                        🔎
                    </div>

                    <h3>
                        No articles found
                    </h3>

                    <p>
                        Try searching for another topic.
                    </p>

                </div>

            `;


    /* =====================================================
       RENDER
       ===================================================== */

    mainContent.innerHTML = `

        <section class="hero">

            <div class="container">

                <h1>
                    ${escapeHTML(pageTitle)}
                </h1>

                <p>
                    ${escapeHTML(pageDescription)}
                </p>

            </div>

        </section>


        <section
            class="container"
            aria-label="Blog articles"
        >

            ${postsHTML}

        </section>

    `;


    updateHomeSEO(
        pageTitle,
        pageDescription
    );

}


/* =========================================================
   13. SINGLE POST PAGE
   ========================================================= */

function renderSinglePost() {

    if (!mainContent) {
        return;
    }


    const postId =
        getURLParameter("id");


    const post =
        posts.find(function(item) {

            return item.id === postId;

        });


    if (!post) {

        renderPostNotFound();

        return;

    }


    const introduction =
        post.content?.introduction || "";


    const htmlCode =
        post.content?.htmlCode || "";


    const cssCode =
        post.content?.cssCode || "";


    const jsCode =
        post.content?.jsCode || "";


    const conclusion =
        post.content?.conclusion || "";


    /* =====================================================
       BUILD ARTICLE CONTENT
       ===================================================== */

    let articleContent = "";


    /* Introduction */

    if (introduction) {

        articleContent += `

            <div class="article-text">

                ${formatText(introduction)}

            </div>

        `;

    }


    /* HTML */

    if (htmlCode) {

        articleContent += `

            <h2>
                HTML Code
            </h2>

            ${createCodeBlock(
                "HTML",
                htmlCode,
                "markup"
            )}

        `;

    }


    /* CSS */

    if (cssCode) {

        articleContent += `

            <h2>
                CSS Code
            </h2>

            ${createCodeBlock(
                "CSS",
                cssCode,
                "css"
            )}

        `;

    }


    /* JavaScript */

    if (jsCode) {

        articleContent += `

            <h2>
                JavaScript Code
            </h2>

            ${createCodeBlock(
                "JavaScript",
                jsCode,
                "javascript"
            )}

        `;

    }


    /* Conclusion */

    if (conclusion) {

        articleContent += `

            <h2>
                Conclusion
            </h2>

            <div class="article-text">

                ${formatText(conclusion)}

            </div>

        `;

    }


    /* =====================================================
       TAGS
       ===================================================== */

    const tagsHTML =
        post.tags && post.tags.length

            ? `

                <div class="post-tags">

                    ${post.tags
                        .map(function(tag) {

                            return `

                                <span class="tag">
                                    #${escapeHTML(tag)}
                                </span>

                            `;

                        })
                        .join("")}

                </div>

            `

            : "";


    /* =====================================================
       FEATURED IMAGE
       ===================================================== */

    const imageHTML =
        post.image

            ? `

                <div class="featured-image">

                    <img
                        src="${escapeHTML(post.image)}"
                        alt="${escapeHTML(post.title)}"
                    >

                </div>

            `

            : "";


    /* =====================================================
       RENDER ARTICLE
       ===================================================== */

    mainContent.innerHTML = `

        <article class="single-post">

            <div class="content-container">


                <header class="post-header">

                    <span class="post-category">

                        ${escapeHTML(post.category)}

                    </span>


                    <h1>

                        ${escapeHTML(post.title)}

                    </h1>


                    <div class="post-meta">

                        <span>
                            ${escapeHTML(post.date)}
                        </span>

                        <span class="dot">
                            •
                        </span>

                        <span>
                            By ${escapeHTML(post.author)}
                        </span>

                    </div>

                </header>


                ${imageHTML}


                <div class="post-content">

                    ${articleContent}

                </div>


                ${tagsHTML}


                ${createRelatedPosts(post)}


            </div>

        </article>

    `;


    updatePostSEO(post);


    initializeCopyButtons();


    if (window.Prism) {

        Prism.highlightAll();

    }

}


/* =========================================================
   14. FORMAT NORMAL TEXT
   ========================================================= */

function formatText(text) {

    if (!text) {
        return "";
    }


    /*
       Escape HTML first so admin text cannot
       inject unwanted HTML.
    */

    const safeText =
        escapeHTML(text);


    /*
       Convert blank lines into paragraphs.
    */

    const paragraphs =
        safeText
            .split(/\n\s*\n/)
            .map(function(paragraph) {

                return `
                    <p>
                        ${paragraph
                            .replace(/\n/g, "<br>")}
                    </p>
                `;

            })
            .join("");


    return paragraphs;

}


/* =========================================================
   15. CREATE CODE BLOCK
   ========================================================= */

function createCodeBlock(
    label,
    code,
    language
) {

    return `

        <div class="code-block-wrapper">

            <div class="code-header">

                <span class="code-label">
                    ${escapeHTML(label)}
                </span>


                <button
                    class="copy-btn"
                    type="button"
                >
                    Copy
                </button>

            </div>


            <pre><code class="language-${escapeHTML(language)}">${escapeHTML(code)}</code></pre>

        </div>

    `;

}


/* =========================================================
   16. RELATED POSTS
   ========================================================= */

function createRelatedPosts(currentPost) {

    const relatedPosts =
        posts
            .filter(function(post) {

                return (

                    post.id !== currentPost.id &&

                    post.category &&
                    currentPost.category &&

                    post.category.toLowerCase() ===
                    currentPost.category.toLowerCase()

                );

            })
            .slice(0, 3);


    if (!relatedPosts.length) {

        return "";

    }


    return `

        <section
            class="related-section"
            aria-label="Related articles"
        >

            <h2>
                Related Articles
            </h2>


            <div class="related-grid">

                ${relatedPosts
                    .map(function(post) {

                        return `

                            <article class="related-card">

                                <h3>

                                    <a
                                        href="post.html?id=${encodeURIComponent(post.id)}"
                                    >
                                        ${escapeHTML(post.title)}
                                    </a>

                                </h3>


                                <div class="related-meta">

                                    ${escapeHTML(post.date)}

                                </div>

                            </article>

                        `;

                    })
                    .join("")}

            </div>

        </section>

    `;

}


/* =========================================================
   17. POST NOT FOUND
   ========================================================= */

function renderPostNotFound() {

    if (!mainContent) {
        return;
    }


    mainContent.innerHTML = `

        <section class="empty-state">

            <div class="empty-icon">
                📄
            </div>


            <h1>
                Article Not Found
            </h1>


            <p>
                The article you are looking for does not exist
                or may have been removed.
            </p>


            <br>


            <a href="index.html">
                ← Back to Home
            </a>

        </section>

    `;


    document.title =
        "Article Not Found | DevBlog";

}


/* =========================================================
   18. SEARCH
   ========================================================= */

function initializeSearch() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "keydown",
        function(event) {

            if (event.key !== "Enter") {
                return;
            }


            const searchTerm =
                searchInput.value.trim();


            if (!searchTerm) {

                window.location.href =
                    "index.html";

                return;

            }


            window.location.href =
                `index.html?search=${encodeURIComponent(searchTerm)}`;

        }
    );

}


/* =========================================================
   19. SEARCH INPUT STATE
   ========================================================= */

function initializeSearchInput() {

    if (!searchInput) {
        return;
    }


    const search =
        getURLParameter("search");


    if (search) {

        searchInput.value =
            search;

    }

}


/* =========================================================
   20. COPY CODE BUTTONS
   ========================================================= */

function initializeCopyButtons() {

    const buttons =
        document.querySelectorAll(
            ".copy-btn"
        );


    buttons.forEach(function(button) {

        button.addEventListener(
            "click",
            async function() {

                const wrapper =
                    button.closest(
                        ".code-block-wrapper"
                    );


                if (!wrapper) {
                    return;
                }


                const code =
                    wrapper.querySelector(
                        "code"
                    );


                if (!code) {
                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        code.textContent
                    );


                    const originalText =
                        button.textContent;


                    button.textContent =
                        "Copied!";


                    setTimeout(function() {

                        button.textContent =
                            originalText;

                    }, 1500);


                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );


                    /*
                       Fallback for browsers where
                       Clipboard API is unavailable.
                    */

                    try {

                        const textarea =
                            document.createElement(
                                "textarea"
                            );

                        textarea.value =
                            code.textContent;

                        document.body.appendChild(
                            textarea
                        );

                        textarea.select();

                        document.execCommand(
                            "copy"
                        );

                        textarea.remove();

                        button.textContent =
                            "Copied!";


                        setTimeout(function() {

                            button.textContent =
                                "Copy";

                        }, 1500);


                    } catch (fallbackError) {

                        console.error(
                            "Fallback copy failed:",
                            fallbackError
                        );

                    }

                }

            }
        );

    });

}


/* =========================================================
   21. SEO - HOME PAGE
   ========================================================= */

function updateHomeSEO(
    title,
    description
) {

    document.title =
        `${title} | DevBlog`;


    updateMeta(
        "metaDescription",
        "content",
        description
    );


    updateMeta(
        "ogType",
        "content",
        "website"
    );


    updateMeta(
        "ogTitle",
        "content",
        `${title} | DevBlog`
    );


    updateMeta(
        "ogDescription",
        "content",
        description
    );


    updateMeta(
        "twitterTitle",
        "content",
        `${title} | DevBlog`
    );


    updateMeta(
        "twitterDescription",
        "content",
        description
    );


    const currentURL =
        window.location.href;


    updateMeta(
        "ogUrl",
        "content",
        currentURL
    );


    updateCanonical(
        currentURL
    );

}


/* =========================================================
   22. SEO - SINGLE POST
   ========================================================= */

function updatePostSEO(post) {

    const title =
        `${post.title} | DevBlog`;


    document.title =
        title;


    updateMeta(
        "metaDescription",
        "content",
        post.description
    );


    updateMeta(
        "ogType",
        "content",
        "article"
    );


    updateMeta(
        "ogTitle",
        "content",
        title
    );


    updateMeta(
        "ogDescription",
        "content",
        post.description
    );


    updateMeta(
        "twitterTitle",
        "content",
        title
    );


    updateMeta(
        "twitterDescription",
        "content",
        post.description
    );


    const currentURL =
        window.location.href;


    updateMeta(
        "ogUrl",
        "content",
        currentURL
    );


    updateCanonical(
        currentURL
    );


    if (post.image) {

        updateMeta(
            "ogImage",
            "content",
            post.image
        );


        updateMeta(
            "twitterImage",
            "content",
            post.image
        );

    }

}


/* =========================================================
   23. UPDATE META TAG
   ========================================================= */

function updateMeta(
    id,
    attribute,
    value
) {

    const element =
        document.getElementById(id);


    if (!element) {
        return;
    }


    element.setAttribute(
        attribute,
        value
    );

}


/* =========================================================
   24. CANONICAL URL
   ========================================================= */

function updateCanonical(url) {

    const canonical =
        document.getElementById(
            "canonicalLink"
        );


    if (!canonical) {
        return;
    }


    const cleanURL =
        url.split("?")[0];


    canonical.setAttribute(
        "href",
        cleanURL
    );

}


/* =========================================================
   25. ACTIVE CATEGORY
   ========================================================= */

function setActiveCategory() {

    const category =
        getURLParameter("category");


    const links =
        document.querySelectorAll(
            ".nav-links a"
        );


    links.forEach(function(link) {

        link.classList.remove(
            "active"
        );

    });


    if (!category) {

        const home =
            document.querySelector(
                '.nav-links a[data-category="all"]'
            );


        if (home) {

            home.classList.add(
                "active"
            );

        }


        return;

    }


    links.forEach(function(link) {

        const linkCategory =
            link.getAttribute(
                "data-category"
            );


        if (

            linkCategory &&

            linkCategory.toLowerCase() ===
            category.toLowerCase()

        ) {

            link.classList.add(
                "active"
            );

        }

    });

}


/* =========================================================
   26. INITIALIZE APPLICATION
   ========================================================= */

async function initializePage() {

    console.log(
        "🚀 DevBlog starting..."
    );


    /* Theme */

    initializeTheme();


    /* Mobile menu */

    initializeMobileMenu();


    /* Search */

    initializeSearch();

    initializeSearchInput();


    /* Theme button */

    if (themeToggle) {

        themeToggle.addEventListener(
            "click",
            toggleTheme
        );

    }


    /* =====================================================
       LOAD FIRESTORE POSTS
       ===================================================== */

    await loadPosts();


    /* =====================================================
       DETECT PAGE
       ===================================================== */

    const currentPath =
        window.location.pathname
            .toLowerCase();


    const isPostPage =
        currentPath.endsWith(
            "post.html"
        );


    if (isPostPage) {

        renderSinglePost();

    } else {

        renderHomePage();

        setActiveCategory();

    }


    console.log(
        "✅ DevBlog initialized successfully."
    );

}


/* =========================================================
   27. START APPLICATION
   ========================================================= */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePage
    );

} else {

    initializePage();

}