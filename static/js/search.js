// static/js/search.js

(function() {
    console.log('search.js script started execution for page search.'); // Debug log
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResultsDropdown = document.getElementById('search-results'); 
    let searchIndex = [];

    if (!searchForm || !searchInput || !searchResultsDropdown) {
        console.warn('Search elements (form, input, or results container) not found. Search functionality might not initialize.');
        return;
    }
    console.log('Search elements found:', { searchForm, searchInput, searchResultsDropdown });

    async function fetchSearchIndex() {
        try {
            console.log('Attempting to fetch /index.json...');
            const response = await fetch('/index.json'); 
            
            if (!response.ok) {
                console.error(`HTTP error fetching search index! Status: ${response.status} ${response.statusText}`);
                return;
            }
            
            searchIndex = await response.json();
            console.log('Search index loaded successfully for page search:', searchIndex);

            const urlParams = new URLSearchParams(window.location.search);
            const queryFromUrl = urlParams.get('q') || urlParams.get('query');
            if (window.location.pathname.includes('/search') && queryFromUrl) {
                searchInput.value = queryFromUrl; // Populate input with URL query
                displaySearchResults(queryFromUrl); // Call function to display results on the search page
            }

        } catch (error) {
            console.error('Failed to load or parse search index:', error);
        }
    }

    // Function to display search results on the dedicated search page
    function displaySearchResults(query) {
        const resultsContainerOnSearchPage = document.getElementById('results-list'); // This is in layouts/search/list.html
        if (!resultsContainerOnSearchPage) {
            console.warn('Results container on search page not found (#results-list).');
            return;
        }

        resultsContainerOnSearchPage.innerHTML = '';
        query = query.trim().toLowerCase();

        if (query.length === 0) {
            resultsContainerOnSearchPage.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Please enter a search query.</p>';
            return;
        }

        const filteredResults = searchIndex.filter(item => {
            const titleMatch = item.title && item.title.toLowerCase().includes(query);
            const contentMatch = item.content && item.content.toLowerCase().includes(query);
            const tagsMatch = item.tags && item.tags.some(tag => tag.toLowerCase().includes(query));
            return titleMatch || contentMatch || tagsMatch;
        });

        if (filteredResults.length === 0) {
            resultsContainerOnSearchPage.innerHTML = `<p class="text-gray-500 dark:text-gray-400">No results found for "${query}".</p>`;
        } else {
            // Create a grid container for the search results, similar to homepage
            const postsGrid = document.createElement('div');
            postsGrid.classList.add('posts-grid', 'grid', 'gap-6'); // Use same grid layout

            filteredResults.forEach(item => {
                const resultArticle = document.createElement('article'); 
                // Apply the exact same Tailwind classes for the card box itself
                resultArticle.classList.add(
                    'p-5', 'rounded-lg', 'shadow-md', 'bg-white', 'dark:bg-gray-800',
                    'border', 'border-gray-200', 'dark:border-gray-700'
                );
                
                // Construct inner HTML for each result, mirroring homepage article structure
                // REMOVED text-gray-800 and dark:text-gray-200 from individual elements
                // These elements will now inherit colors from the article, which gets colors from baseof.html's theme rules
                let tagsHtml = '';
                if (item.tags && item.tags.length > 0) {
                    tagsHtml = `<div class="flex flex-wrap gap-2 mb-4">` +
                                item.tags.map(tag => `<a href="/tags/${encodeURIComponent(tag.toLowerCase())}/" class="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold px-2.5 py-0.5 rounded-full hover:bg-mint-accent hover:text-dark-bg-main transition-colors">#${tag}</a>`).join('') +
                                `</div>`;
                }
                
                resultArticle.innerHTML = `
                    <h3 class="text-2xl font-bold mb-2">
                        <a href="${item.uri}" class="post-title-link">
                            ${item.title}
                            <span class="absolute left-0 bottom-[-5px] w-0 h-0.5 bg-current transition-all duration-300 group-hover:w-full"></span>
                        </a>
                    </h3>
                    <p class="text-sm mb-2">
                        Published: ${item.date || 'N/A'}
                        ${item.section ? `| Section: <a href="/${encodeURIComponent(item.section.toLowerCase().replace(/ /g, '-'))}/" class="text-mint-accent hover:underline">${item.section}</a>` : ''}
                    </p>
                    ${tagsHtml}
                    <p class="text-base mb-4">${item.content ? item.content.substring(0, 150) + '...' : ''}</p>
                    <a href="${item.uri}" class="text-mint-accent text-sm font-semibold hover:underline">Read more &rarr;</a>
                `;
                postsGrid.appendChild(resultArticle); // Append to the grid
            });
            resultsContainerOnSearchPage.appendChild(postsGrid); // Add the grid to the results container
        }
    }

    // Event Listeners for the Search Input in the Header
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const query = searchInput.value.trim();
        if (query.length > 0) {
            window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
    });

    searchInput.addEventListener('input', () => {
        // No live dropdown results for this setup
    });

    document.addEventListener('click', (event) => {
        if (!searchForm.contains(event.target)) {
            // No dropdown to hide in this setup
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            searchInput.blur();
        }
    });

    fetchSearchIndex();
})();
