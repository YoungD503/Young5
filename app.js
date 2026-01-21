const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

menuBtn.addEventListener("click", ()=>{
  navMenu.classList.toggle("active");
});

// Close menu when clicking link
document.querySelectorAll("nav a").forEach(link=>{
  link.addEventListener("click",()=>{
    navMenu.classList.remove("active");
  });
});
