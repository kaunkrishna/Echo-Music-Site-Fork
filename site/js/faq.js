      const faqItems = document.querySelectorAll(".faq-item");
      faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        const icon = item.querySelector(".faq-icon");

        question.addEventListener("click", () => {
          const isOpen = item.classList.contains("open");

          const parentList = item.closest(".faq-list");
          parentList.querySelectorAll(".faq-item").forEach((otherItem) => {
            if (otherItem !== item) {
              otherItem.classList.remove("open");
              otherItem.querySelector(".faq-icon").textContent = "+";
              otherItem.querySelector(".faq-answer").style.maxHeight = null;
            }
          });

          if (isOpen) {
            item.classList.remove("open");
            icon.textContent = "+";
            answer.style.maxHeight = null;
          } else {
            item.classList.add("open");
            icon.textContent = "−";
            answer.style.maxHeight = answer.scrollHeight + 36 + "px";
          }
        });
      });

      const searchInput = document.getElementById("faqSearch");
      const noResults = document.getElementById("noResults");
      const categories = document.querySelectorAll(".faq-category");

      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        let hasAnyVisible = false;

        faqItems.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (text.includes(term)) {
            item.style.display = "block";
            hasAnyVisible = true;
          } else {
            item.style.display = "none";

            item.classList.remove("open");
            item.querySelector(".faq-icon").textContent = "+";
            item.querySelector(".faq-answer").style.maxHeight = null;
          }
        });

        categories.forEach((category) => {
          const list = category.nextElementSibling;
          const visibleItems = Array.from(list.querySelectorAll(".faq-item")).filter((i) => i.style.display !== "none");
          if (visibleItems.length === 0) {
            category.style.display = "none";
            list.style.display = "none";
          } else {
            category.style.display = "block";
            list.style.display = "flex";
          }
        });

        if (!hasAnyVisible) {
          noResults.style.display = "block";
        } else {
          noResults.style.display = "none";
        }
      });